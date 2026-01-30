const express = require('express');
const router = express.Router();
const balanceController = require('./balance.controller');
const authMiddleware = require('../../shared/middleware/auth');

// All routes require authentication
router.use(authMiddleware);

router.get('/', balanceController.getBalance);
router.post('/sync', balanceController.syncBalance);

module.exports = router;
