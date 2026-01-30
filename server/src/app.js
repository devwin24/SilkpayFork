require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

const connectDB = require('./shared/config/database');
const logger = require('./shared/utils/logger');
const errorHandler = require('./shared/middleware/errorHandler');

const app = express();

// Security Middleware
app.use(helmet());
app.use(mongoSanitize());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || 'http://localhost:3000',
  credentials: true
}));

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later'
});
app.use('/api/', limiter);

// Request ID (for tracing)
const requestId = require('./shared/middleware/requestId');
app.use(requestId);

// Request Logging with Response Time
app.use((req, res, next) => {
  const start = Date.now();
  
  // Log when response finishes
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      requestId: req.id,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent')
    };

    // Warn on slow requests (>1 second)
    if (duration > 1000) {
      logger.warn('Slow request detected', logData);
    } else {
      logger.info('Request completed', logData);
    }
  });
  
  next();
});

// Health Check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', require('./modules/auth').routes);
app.use('/api/merchant', require('./modules/merchant').routes);
app.use('/api/beneficiaries', require('./modules/beneficiary').routes);
app.use('/api/payouts', require('./modules/payout').routes);
app.use('/api/transactions', require('./modules/transaction').routes);
app.use('/api/dashboard', require('./modules/dashboard').routes);
app.use('/api/balance', require('./modules/balance').routes);
app.use('/api/webhook', require('./modules/webhook').routes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`
    }
  });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
