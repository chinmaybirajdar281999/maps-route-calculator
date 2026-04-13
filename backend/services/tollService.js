const { Pool } = require('pg');

// PostgreSQL connection pool
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        max: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'route_toll_db',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      }
);

// Haversine distance between two points in km
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Distance from point to line segment
function getDistanceFromPointToLineSegment(tollLat, tollLon, lineStart, lineEnd) {
  const [lat1, lon1] = lineStart;
  const [lat2, lon2] = lineEnd;

  const midLat = (lat1 + lat2) / 2;
  const cosLat = Math.cos(midLat * Math.PI / 180);

  const A = (tollLon - lon1) * cosLat;
  const B = tollLat - lat1;
  const C = (lon2 - lon1) * cosLat;
  const D = lat2 - lat1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;

  let param = -1;
  if (lenSq !== 0) param = dot / lenSq;

  let closestLat, closestLon;
  if (param < 0) {
    closestLat = lat1;
    closestLon = lon1;
  } else if (param > 1) {
    closestLat = lat2;
    closestLon = lon2;
  } else {
    closestLat = lat1 + param * D;
    closestLon = lon1 + param * C;
  }

  return haversineDistance(tollLat, tollLon, closestLat, closestLon);
}

function getMinDistanceToRoute(tollLat, tollLon, routeCoordinates) {
  let minDistance = Infinity;
  for (let i = 0; i < routeCoordinates.length - 1; i++) {
    const distance = getDistanceFromPointToLineSegment(
      tollLat, tollLon,
      [routeCoordinates[i][1], routeCoordinates[i][0]],
      [routeCoordinates[i + 1][1], routeCoordinates[i + 1][0]]
    );
    if (distance < minDistance) minDistance = distance;
  }
  return minDistance;
}

// In-memory toll plaza cache — avoids hitting PostgreSQL on every request
let cachedTolls = null;
let cacheTimestamp = 0;
const TOLL_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

async function getAllTolls() {
  const now = Date.now();
  if (cachedTolls && (now - cacheTimestamp) < TOLL_CACHE_TTL) {
    return cachedTolls;
  }
  const result = await pool.query('SELECT * FROM toll_plazas WHERE active = true');
  cachedTolls = result.rows;
  cacheTimestamp = now;
  return cachedTolls;
}

async function getTollsOnRoute(coordinates, vehicleType) {
  try {
    const tollPlazas = await getAllTolls();
    const bufferDistance = 5; // 5 km buffer

    // Bounding box for fast rejection
    let minLat = Infinity, maxLat = -Infinity, minLon = Infinity, maxLon = -Infinity;
    for (const coord of coordinates) {
      const lon = coord[0], lat = coord[1];
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lon < minLon) minLon = lon;
      if (lon > maxLon) maxLon = lon;
    }
    const degBuffer = 0.05;
    minLat -= degBuffer; maxLat += degBuffer;
    minLon -= degBuffer; maxLon += degBuffer;

    const tollsOnRoute = [];
    let totalCost = 0;

    for (const toll of tollPlazas) {
      if (toll.latitude < minLat || toll.latitude > maxLat ||
          toll.longitude < minLon || toll.longitude > maxLon) {
        continue;
      }

      const minDistance = getMinDistanceToRoute(toll.latitude, toll.longitude, coordinates);

      if (minDistance <= bufferDistance) {
        const isDuplicate = tollsOnRoute.some(existing =>
          haversineDistance(toll.latitude, toll.longitude, existing.coordinates[1], existing.coordinates[0]) < 5
        );
        if (isDuplicate) continue;

        const charge = getTollCharge(toll, vehicleType);
        const chargeNum = typeof charge === 'string' ? parseFloat(charge) : Number(charge);
        tollsOnRoute.push({
          id: toll.id,
          name: toll.name,
          location: toll.location_name,
          charge: Number(chargeNum),
          coordinates: [Number(toll.longitude), Number(toll.latitude)]
        });
        totalCost += Number(chargeNum);
      }
    }

    totalCost = isNaN(totalCost) ? 0 : totalCost;

    return { tollPlazas: tollsOnRoute, totalCost };
  } catch (error) {
    console.error('Error getting tolls:', error);
    throw error;
  }
}

function getTollCharge(toll, vehicleType) {
  const charges = {
    car: parseFloat(toll.car_charge) || 0,
    truck: parseFloat(toll.truck_charge) || 0,
    bus: parseFloat(toll.bus_charge) || 0,
    motorcycle: parseFloat(toll.motorcycle_charge) || 0
  };
  return charges[vehicleType] || charges.car;
}

module.exports = { getTollsOnRoute, haversineDistance, getDistanceFromPointToLineSegment, getMinDistanceToRoute, getTollCharge };