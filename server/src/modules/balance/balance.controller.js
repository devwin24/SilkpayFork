const balanceService = require('./balance.service');

/**
 * Get current balance
 * GET /api/balance
 */
exports.getBalance = async (req, res, next) => {
  try {
    const merchantId = req.user._id;
    const balance = await balanceService.getBalance(merchantId);
    
    res.json({
      success: true,
      data: balance
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Sync balance with SilkPay
 * POST /api/balance/sync
 */
exports.syncBalance = async (req, res, next) => {
  try {
    const merchantId = req.user._id;
    const balance = await balanceService.syncBalance(merchantId);
    
    res.json({
      success: true,
      data: balance
    });
  } catch (error) {
    next(error);
  }
};
