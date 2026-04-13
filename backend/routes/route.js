const express = require('express');
const router = express.Router();
const { calculateRoute, calculateRouteAsync, getJobResult, getTollInfo } = require('../controllers/routeController');
const { validateRouteInput } = require('../middleware/validation');

// Synchronous route calculation (Cache → Dedup → Circuit Breaker → Mapbox)
router.post('/calculate', validateRouteInput, calculateRoute);

// Async route calculation via job queue — returns jobId immediately
router.post('/calculate-async', validateRouteInput, calculateRouteAsync);

// Poll job result
router.get('/job/:id', getJobResult);

router.get('/tolls', getTollInfo);

module.exports = router;