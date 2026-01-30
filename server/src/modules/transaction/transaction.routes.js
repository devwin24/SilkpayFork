const express = require('express');
const router = express.Router();
const transactionController = require('./transaction.controller');
const authMiddleware = require('../../shared/middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// GET /api/transactions/export - Export CSV (must be before /:id)
router.get('/export', transactionController.exportTransactions);

// GET /api/transactions/stats - Get statistics
router.get('/stats', transactionController.getTransactionStats);

// GET /api/transactions - List transactions
router.get('/', transactionController.getTransactions);

// GET /api/transactions/:id - Get single transaction
router.get('/:id', transactionController.getTransactionById);

module.exports = router;
