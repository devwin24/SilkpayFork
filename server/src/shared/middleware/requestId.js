const { v4: uuidv4 } = require('uuid');

/**
 * Request ID Middleware
 * Adds unique ID to each request for tracing through logs
 */
module.exports = (req, res, next) => {
  // Generate unique request ID
  req.id = uuidv4();
  
  // Add to response headers (useful for debugging)
  res.setHeader('X-Request-ID', req.id);
  
  next();
};
