const express = require('express');
const router = express.Router();
const payoutController = require('./payout.controller');
const { validateCreatePayout } = require('./payout.validator');
const authMiddleware = require('../../shared/middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// POST /api/payouts - Create payout
router.post('/', validateCreatePayout, payoutController.createPayout);

// GET /api/payouts - List payouts
router.get('/', payoutController.getPayouts);

// GET /api/payouts/:id - Get single payout
router.get('/:id', payoutController.getPayoutById);

// GET /api/payouts/:id/status - Query payout status
router.get('/:id/status', payoutController.queryPayoutStatus);

module.exports = router;
