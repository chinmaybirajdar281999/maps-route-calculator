function errorHandler(err, req, res, next) {
  console.error('Error:', err);
  
  // Mapbox API errors
  if (err.response && err.response.status === 422) {
    return res.status(400).json({
      error: 'Invalid route parameters',
      message: 'Unable to find route between specified locations'
    });
  }
  
  // Timeout errors
  if (err.code === 'ECONNABORTED') {
    return res.status(504).json({
      error: 'Request timeout',
      message: 'External service took too long to respond'
    });
  }
  
  // Default error
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString()
  });
}

module.exports = { errorHandler };