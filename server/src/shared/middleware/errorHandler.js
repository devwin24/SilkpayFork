const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: errors.join(', ')
      }
    });
  }

  // Mongoose Cast Error (Invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_ID',
        message: `Invalid ${err.path}: ${err.value}`
      }
    });
  }

  // Duplicate Key Error (MongoDB)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE_ERROR',
        message: `${field} already exists`
      }
    });
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid authentication token'
      }
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'TOKEN_EXPIRED',
        message: 'Authentication token has expired'
      }
    });
  }

  // Default Error
  const statusCode = err.statusCode || 500;
  
  // Sanitize request body (remove sensitive fields)
  const sanitizeBody = (body) => {
    if (!body) return undefined;
    const sanitized = { ...body };
    ['password', 'newPassword', 'oldPassword', 'currentPassword', 'token'].forEach(field => {
      if (sanitized[field]) sanitized[field] = '***REDACTED***';
    });
    return sanitized;
  };

  // Enhanced error logging with context
  logger.error('Error occurred', {
    requestId: req.id,
    userId: req.user?._id,
    userEmail: req.user?.email,
    message: err.message,
    stack: err.stack,
    code: err.code,
    statusCode,
    path: req.path,
    method: req.method,
    query: req.query,
    body: req.method !== 'GET' ? sanitizeBody(req.body) : undefined
  });

  // Build error response
  const response = {
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'Internal server error'
    }
  };

  // Add request ID to response for tracking
  response.requestId = req.id;

  // In development, add stack trace and extra details
  if (process.env.NODE_ENV === 'development') {
    response.error.stack = err.stack;
    response.error.details = err.details;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
