const payoutService = require('./payout.service');

/**
 * Create payout
 * POST /api/payouts
 */
exports.createPayout = async (req, res, next) => {
  try {
    const merchantId = req.user._id;
    const merchantNo = req.user.merchant_no;
    
    const payout = await payoutService.createPayout(merchantId, merchantNo, req.body);
    
    res.status(201).json({
      success: true,
      data: payout
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all payouts
 * GET /api/payouts
 */
exports.getPayouts = async (req, res, next) => {
  try {
    const merchantId = req.user._id;
    const filters = {
      status: req.query.status,
      beneficiary_id: req.query.beneficiary_id,
      search: req.query.search,
      page: req.query.page || 1,
      limit: req.query.limit || 10
    };
    
    const result = await payoutService.getPayouts(merchantId, filters);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single payout
 * GET /api/payouts/:id
 */
exports.getPayoutById = async (req, res, next) => {
  try {
    const merchantId = req.user._id;
    const payoutId = req.params.id;
    
    const payout = await payoutService.getPayoutById(payoutId, merchantId);
    
    res.json({
      success: true,
      data: payout
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Query payout status
 * GET /api/payouts/:id/status
 */
exports.queryPayoutStatus = async (req, res, next) => {
  try {
    const merchantId = req.user._id;
    const payoutId = req.params.id;
    
    const payout = await payoutService.queryPayoutStatus(payoutId, merchantId);
    
    res.json({
      success: true,
      data: payout
    });
  } catch (error) {
    next(error);
  }
};
