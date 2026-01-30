require('dotenv').config();
const connectDB = require('../src/shared/config/database');
const agenda = require('../src/shared/config/agenda');
const logger = require('../src/shared/utils/logger');

/**
 * Email Worker
 * Processes email jobs from MongoDB queue (Agenda)
 * 
 * Run: npm run worker:email
 */

// Connect to MongoDB
connectDB().then(async () => {
  logger.info('📧 Email Worker started');

  // Start agenda
  await agenda.start();
  
  logger.info('Agenda started - processing email jobs');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down email worker');
  await agenda.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down email worker');
  await agenda.stop();
  process.exit(0);
});
