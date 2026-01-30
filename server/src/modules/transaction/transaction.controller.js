const transactionService = require('./transaction.service');

/**
 * Get all transactions
 * GET /api/transactions
 */
exports.getTransactions = async (req, res, next) => {
  try {
    const merchantId = req.user._id;
    const filters = {
      type: req.query.type,
      payout_id: req.query.payout_id,
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      search: req.query.search,
      page: req.query.page || 1,
      limit: req.query.limit || 20
    };
    
    const result = await transactionService.getTransactions(merchantId, filters);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single transaction
 * GET /api/transactions/:id
 */
exports.getTransactionById = async (req, res, next) => {
  try {
    const merchantId = req.user._id;
    const transactionId = req.params.id;
    
    const transaction = await transactionService.getTransactionById(transactionId, merchantId);
    
    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Export transactions to CSV
 * GET /api/transactions/export
 */
exports.exportTransactions = async (req, res, next) => {
  try {
    const merchantId = req.user._id;
    const filters = {
      type: req.query.type,
      start_date: req.query.start_date,
      end_date: req.query.end_date
    };
    
    const csv = await transactionService.exportTransactions(merchantId, filters);
    
    // Set CSV headers
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=transactions_${Date.now()}.csv`);
    
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

/**
 * Get transaction statistics
 * GET /api/transactions/stats
 */
exports.getTransactionStats = async (req, res, next) => {
  try {
    const merchantId = req.user._id;
    const filters = {
      start_date: req.query.start_date,
      end_date: req.query.end_date
    };
    
    const stats = await transactionService.getTransactionStats(merchantId, filters);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};
