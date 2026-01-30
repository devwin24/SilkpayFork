const Payout = require('../payout/payout.model');
const payoutService = require('../payout/payout.service');
const silkpayService = require('../../shared/services/silkpayService');
const logger = require('../../shared/utils/logger');

/**
 * Handle SilkPay webhook callback
 * POST /api/webhook/silkpay
 */
exports.handleSilkPayWebhook = async (req, res, next) => {
  try {
    const webhookData = req.body;
    
    logger.info('Received SilkPay webhook', { 
      out_trade_no: webhookData.out_trade_no,
      status: webhookData.status
    });

    // Extract signature
    const receivedSign = webhookData.sign;
    delete webhookData.sign;

    // Verify signature
    const isValid = silkpayService.verifySignature(webhookData, receivedSign);
    
    if (!isValid) {
      logger.warn('Invalid webhook signature', { 
        out_trade_no: webhookData.out_trade_no 
      });
      
      return res.status(401).json({
        code: 'INVALID_SIGNATURE',
        message: 'Invalid signature'
      });
    }

    // Find payout
    const payout = await Payout.findOne({ 
      out_trade_no: webhookData.out_trade_no 
    });

    if (!payout) {
      logger.warn('Payout not found for webhook', { 
        out_trade_no: webhookData.out_trade_no 
      });
      
      return res.status(404).json({
        code: 'PAYOUT_NOT_FOUND',
        message: 'Payout not found'
      });
    }

    // Update webhook tracking
    payout.webhook_received = true;
    payout.webhook_count += 1;
    payout.last_webhook_at = new Date();

    // Update payout status if changed
    if (webhookData.status && webhookData.status !== payout.status) {
      await payoutService.updatePayoutStatus(payout, webhookData.status, webhookData);
    } else {
      await payout.save();
    }

    logger.info('Webhook processed successfully', { 
      out_trade_no: webhookData.out_trade_no,
      status: webhookData.status
    });

    // Return success to SilkPay
    // Official Spec requires string "OK"
    res.send('OK');
  } catch (error) {
    logger.error('Webhook processing failed', { error: error.message });
    next(error);
  }
};
