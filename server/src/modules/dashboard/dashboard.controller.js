const dashboardService = require('./dashboard.service');

/**
 * Get dashboard overview
 * GET /api/dashboard/overview
 */
exports.getOverview = async (req, res, next) => {
  try {
    const merchantId = req.user._id;
    const overview = await dashboardService.getOverview(merchantId);
    
    res.json({
      success: true,
      data: overview
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get payout trends
 * GET /api/dashboard/trends
 */
exports.getPayoutTrends = async (req, res, next) => {
  try {
    const merchantId = req.user._id;
    const days = parseInt(req.query.days) || 30;
    
    const trends = await dashboardService.getPayoutTrends(merchantId, days);
    
    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get top beneficiaries
 * GET /api/dashboard/top-beneficiaries
 */
exports.getTopBeneficiaries = async (req, res, next) => {
  try {
    const merchantId = req.user._id;
    const limit = parseInt(req.query.limit) || 5;
    
    const topBeneficiaries = await dashboardService.getTopBeneficiaries(merchantId, limit);
    
    res.json({
      success: true,
      data: topBeneficiaries
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get recent activity
 * GET /api/dashboard/recent-activity
 */
exports.getRecentActivity = async (req, res, next) => {
  try {
    const merchantId = req.user._id;
    const limit = parseInt(req.query.limit) || 10;
    
    const activity = await dashboardService.getRecentActivity(merchantId, limit);
    
    res.json({
      success: true,
      data: activity
    });
  } catch (error) {
    next(error);
  }
};
