require('dotenv').config();
const cron = require('node-cron');
const connectDB = require('../src/shared/config/database');
const Merchant = require('../src/modules/merchant/merchant.model');
const balanceService = require('../src/modules/balance/balance.service');
const logger = require('../src/shared/utils/logger');

/**
 * Balance Sync Worker
 * Syncs merchant balance with SilkPay hourly
 * 
 * Run: npm run worker:balance-sync
 */

let isRunning = false;

async function syncMerchantBalances() {
  if (isRunning) {
    logger.debug('Balance sync already running, skipping...');
    return;
  }

  isRunning = true;

  try {
    // Get all active merchants
    const merchants = await Merchant.find({ status: 'ACTIVE' });

    if (merchants.length === 0) {
      logger.debug('No active merchants to sync');
      isRunning = false;
      return;
    }

    logger.info(`Syncing balance for ${merchants.length} merchants`);

    for (const merchant of merchants) {
      try {
        await balanceService.syncBalance(merchant._id);
        logger.info(`Balance synced for merchant ${merchant.merchant_no}`);

        // Delay between requests
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 seconds
      } catch (error) {
        logger.error(`Failed to sync balance for ${merchant.merchant_no}:`, error.message);
        // Continue with next merchant
      }
    }

    logger.info('Balance sync completed');
  } catch (error) {
    logger.error('Balance sync worker error:', error);
  } finally {
    isRunning = false;
  }
}

// Connect to MongoDB
connectDB().then(() => {
  logger.info('💰 Balance Sync Worker started');

  // Run every hour at minute 0
  cron.schedule('0 * * * *', () => {
    logger.info('Running balance sync...');
    syncMerchantBalances();
  });

  // Run immediately on startup
  syncMerchantBalances();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down balance sync worker');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down balance sync worker');
  process.exit(0);
});
