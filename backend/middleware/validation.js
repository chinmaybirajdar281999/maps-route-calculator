function validateRouteInput(req, res, next) {
  const { source, destination } = req.body;
  
  if (!source || !destination) {
    return res.status(400).json({ 
      error: 'Source and destination are required' 
    });
  }
  
  if (!isValidCoordinate(source) || !isValidCoordinate(destination)) {
    return res.status(400).json({ 
      error: 'Invalid coordinates provided' 
    });
  }
  
  next();
}

function isValidCoordinate(coord) {
  return coord.lat >= -90 && coord.lat <= 90 &&
         coord.lng >= -180 && coord.lng <= 180;
}

module.exports = { validateRouteInput };