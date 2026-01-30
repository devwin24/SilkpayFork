const express = require('express');
const router = express.Router();
const webhookController = require('./webhook.controller');

// Webhook route (NO authentication - verified by signature)
router.post('/silkpay', webhookController.handleSilkPayWebhook);

module.exports = router;
