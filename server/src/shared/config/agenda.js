const Agenda = require('agenda');
const logger = require('../utils/logger');

const mongoConnectionString = process.env.MONGODB_URI;

const agenda = new Agenda({
  db: { address: mongoConnectionString, collection: 'agendaJobs' },
  processEvery: '30 seconds',
  maxConcurrency: 20
});

// Job event handlers
agenda.on('ready', () => {
  logger.info('✅ Agenda ready - Job scheduler connected');
});

agenda.on('error', (error) => {
  logger.error('❌ Agenda error:', error);
});

// Define job: Send Email
agenda.define('send-email', async (job) => {
  const { to, subject, body } = job.attrs.data;
  logger.info(`📧 Processing email job: ${to} - ${subject}`);
  
  try {
    const emailService = require('../services/emailService');
    await emailService.sendEmail(to, subject, body);
    logger.info(`✅ Email sent successfully to ${to}`);
  } catch (error) {
    logger.error(`❌ Email send failed for ${to}:`, error.message);
    throw error; // Will retry based on Agenda config
  }
});

module.exports = agenda;
