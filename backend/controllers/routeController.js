const axios = require('axios');
const { getTollsOnRoute } = require('../services/tollService');
const { getCachedRoute, cacheRoute } = require('../services/cacheService');
const { fireMapboxRequest } = require('../services/circuitBreaker');
const { acquireLock, releaseLock, waitForResult } = require('../services/requestDedup');

const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;

// Average fuel efficiency (km/l) and price (₹/l)
const FUEL_EFFICIENCY = {
  car: { kmpl: 15, pricePerLitre: 105 },
  truck: { kmpl: 5, pricePerLitre: 92 },
  bus: { kmpl: 4.5, pricePerLitre: 92 },
  motorcycle: { kmpl: 45, pricePerLitre: 105 },
};

/**
 * Core route processing logic — shared by sync endpoint and job queue worker.
 * Extracted so the queue worker can call the same logic without Express req/res.
 */
async function processRouteCalculation({ source, destination, waypoints = [], vehicleType = 'car', avoidTolls = false }, redis, eventLogger) {
  // Build coordinates string: source;[waypoints;]destination
  const coords = [
    `${source.lng},${source.lat}`,
    ...waypoints.map(w => `${w.lng},${w.lat}`),
    `${destination.lng},${destination.lat}`
  ].join(';');

  // ── Request WITHOUT traffic (free-flow baseline) via Circuit Breaker ──
  const mapboxUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}`;
  const params = {
    access_token: MAPBOX_TOKEN,
    geometries: 'geojson',
    overview: 'full',
    steps: true,
    annotations: 'distance,duration',
    alternatives: waypoints.length === 0
  };
  if (avoidTolls) params.exclude = 'toll';

  const mapboxData = await fireMapboxRequest(mapboxUrl, params);

  const routes = mapboxData.routes;
  if (!routes || routes.length === 0) {
    throw Object.assign(new Error('No routes found for the given locations'), { status: 400 });
  }

  // ── Request WITH traffic via Circuit Breaker ──
  const trafficUrl = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${coords}`;
  const trafficParams = {
    access_token: MAPBOX_TOKEN,
    geometries: 'geojson',
    overview: 'full',
    annotations: 'duration',
    alternatives: false
  };
  if (avoidTolls) trafficParams.exclude = 'toll';

  let trafficDurations = {};
  try {
    const trafficData = await fireMapboxRequest(trafficUrl, trafficParams);
    const trafficRoutes = trafficData.routes || [];
    if (trafficRoutes.length > 0) {
      trafficDurations.primary = Number(trafficRoutes[0].duration.toFixed(0));
    }
  } catch (trafficErr) {
    console.warn('Traffic data unavailable:', trafficErr.message);
  }

  // Fuel estimation helper
  const fuel = FUEL_EFFICIENCY[vehicleType] || FUEL_EFFICIENCY.car;

  // Process each route
  const processedRoutes = await Promise.all(routes.map(async (route, index) => {
    let tolls = { tollPlazas: [], totalCost: 0 };
    if (!avoidTolls) {
      try {
        tolls = await getTollsOnRoute(route.geometry.coordinates, vehicleType);
      } catch (tollError) {
        console.warn('Failed to get toll information:', tollError.message);
      }
    }

    const usdToInrRate = 95;
    const totalCost = typeof tolls.totalCost === 'string' ? parseFloat(tolls.totalCost) : tolls.totalCost;

    const tollPlazas = tolls.tollPlazas.map(toll => {
      const chargeValue = parseFloat(toll.charge);
      return {
        id: Number(toll.id),
        name: String(toll.name),
        location: String(toll.location),
        charge: chargeValue,
        chargeInr: Number((chargeValue * usdToInrRate).toFixed(2)),
        coordinates: [parseFloat(toll.coordinates[0]), parseFloat(toll.coordinates[1])]
      };
    });

    const distanceKm = Number((route.distance / 1000).toFixed(2));
    const fuelLitres = Number((distanceKm / fuel.kmpl).toFixed(2));
    const fuelCostInr = Number((fuelLitres * fuel.pricePerLitre).toFixed(2));
    const tollCostInr = Number((totalCost * usdToInrRate).toFixed(2));

    let durationTraffic = null;
    if (index === 0 && trafficDurations.primary != null) {
      durationTraffic = trafficDurations.primary;
    } else if (trafficDurations.primary != null) {
      const baseRoute = routes[0];
      const ratio = baseRoute.duration > 0
        ? trafficDurations.primary / baseRoute.duration
        : 1;
      durationTraffic = Number((route.duration * ratio).toFixed(0));
    }

    return {
      id: Number(index),
      coordinates: route.geometry.coordinates,
      distance: distanceKm,
      duration: Number(route.duration.toFixed(0)),
      durationTraffic,
      tolls: tollPlazas,
      totalTollCost: tollCostInr,
      fuelCost: fuelCostInr,
      fuelLitres,
      totalTripCost: Number((tollCostInr + fuelCostInr).toFixed(2)),
      currency: 'INR',
      vehicleType
    };
  }));

  const responseData = {
    routes: processedRoutes,
    timestamp: new Date().toISOString()
  };

  // Emit analytics event
  if (eventLogger) {
    eventLogger.emit('route.calculated', {
      source, destination,
      vehicleType,
      avoidTolls,
      waypointCount: waypoints.length,
      routeCount: processedRoutes.length,
      tollCount: processedRoutes[0]?.tolls?.length || 0,
      distanceKm: processedRoutes[0]?.distance,
    });
  }

  return responseData;
}

/**
 * Synchronous route calculation endpoint (POST /calculate).
 * Uses: Cache → Request Dedup → Circuit Breaker → Mapbox → Toll detection
 */
async function calculateRoute(req, res, next) {
  try {
    const { source, destination, waypoints = [], vehicleType = 'car', avoidTolls = false } = req.body;
    const allowedVehicles = ['car', 'truck', 'bus', 'motorcycle'];

    if (!source || !destination || typeof source.lat !== 'number' || typeof source.lng !== 'number' || typeof destination.lat !== 'number' || typeof destination.lng !== 'number') {
      return res.status(400).json({ error: 'Invalid source or destination coordinates' });
    }

    if (!Array.isArray(waypoints) || waypoints.length > 10) {
      return res.status(400).json({ error: 'waypoints must be an array with at most 10 entries' });
    }
    for (const wp of waypoints) {
      if (typeof wp.lat !== 'number' || typeof wp.lng !== 'number') {
        return res.status(400).json({ error: 'Each waypoint must have numeric lat and lng' });
      }
    }

    if (!allowedVehicles.includes(vehicleType)) {
      return res.status(400).json({ error: `vehicleType must be one of: ${allowedVehicles.join(', ')}` });
    }

    const wpKey = waypoints.map(w => `${w.lat}:${w.lng}`).join('|');
    const cacheKey = `route:${source.lat}:${source.lng}:${destination.lat}:${destination.lng}:${wpKey}:${vehicleType}:${avoidTolls}`;

    const redis = req.app.get('redis');
    const eventLogger = req.app.get('eventLogger');

    // ① L2 cache check
    const cachedData = await getCachedRoute(redis, cacheKey);
    if (cachedData) {
      if (eventLogger) eventLogger.emit('cache.hit', { cacheKey });
      return res.json(cachedData);
    }

    // ② Request deduplication — only one in-flight request per cache key
    const gotLock = await acquireLock(redis, cacheKey);
    if (!gotLock) {
      // Another request is already computing this — wait for result
      if (eventLogger) eventLogger.emit('dedup.waiting', { cacheKey });
      const dedupResult = await waitForResult(redis, cacheKey);
      if (dedupResult) {
        if (eventLogger) eventLogger.emit('dedup.hit', { cacheKey });
        return res.json(dedupResult);
      }
      // Timed out waiting — fall through and compute ourselves
    }

    try {
      // ③ Compute route (Circuit Breaker wraps Mapbox calls inside)
      const responseData = await processRouteCalculation(
        { source, destination, waypoints, vehicleType, avoidTolls },
        redis,
        eventLogger
      );

      // ④ Cache result
      await cacheRoute(redis, cacheKey, responseData, 3600);
      res.json(responseData);
    } finally {
      // ⑤ Always release the dedup lock
      await releaseLock(redis, cacheKey).catch(() => {});
    }

  } catch (error) {
    // Circuit breaker OPEN → return 503
    if (error.message && error.message.includes('Breaker is open')) {
      const eventLogger = req.app.get('eventLogger');
      if (eventLogger) eventLogger.emit('circuit.rejected', { error: error.message });
      return res.status(503).json({
        error: 'Service temporarily unavailable',
        message: 'External routing service is experiencing issues. Please retry shortly.',
        retryAfter: 30
      });
    }
    console.error('Route calculation error:', error);
    next(error);
  }
}

/**
 * Async route calculation — enqueue to job queue, return jobId immediately.
 * POST /calculate-async
 */
async function calculateRouteAsync(req, res, next) {
  try {
    const { enqueueRouteJob } = require('../services/jobQueue');
    const { source, destination, waypoints = [], vehicleType = 'car', avoidTolls = false } = req.body;

    if (!source || !destination) {
      return res.status(400).json({ error: 'source and destination are required' });
    }

    const { jobId } = await enqueueRouteJob({ source, destination, waypoints, vehicleType, avoidTolls });

    const eventLogger = req.app.get('eventLogger');
    if (eventLogger) eventLogger.emit('job.enqueued', { jobId, vehicleType });

    res.status(202).json({ jobId, status: 'queued', pollUrl: `/api/route/job/${jobId}` });
  } catch (error) {
    next(error);
  }
}

/**
 * Poll job status — GET /job/:id
 */
async function getJobResult(req, res, next) {
  try {
    const { getJobStatus } = require('../services/jobQueue');
    const result = await getJobStatus(req.params.id);
    const statusCode = result.status === 'completed' ? 200 : result.status === 'not_found' ? 404 : 202;
    res.status(statusCode).json(result);
  } catch (error) {
    next(error);
  }
}

async function getTollInfo(req, res, next) {
  try {
    const { lat, lng } = req.query;
    res.json({ message: 'Toll info endpoint' });
  } catch (error) {
    next(error);
  }
}

module.exports = { calculateRoute, calculateRouteAsync, getJobResult, getTollInfo, processRouteCalculation };