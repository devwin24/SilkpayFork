const express = require('express');
const router = express.Router();
const dashboardController = require('./dashboard.controller');
const authMiddleware = require('../../shared/middleware/auth');

// All routes require authentication
router.use(authMiddleware);

router.get('/overview', dashboardController.getOverview);
router.get('/trends', dashboardController.getPayoutTrends);
router.get('/top-beneficiaries', dashboardController.getTopBeneficiaries);
router.get('/recent-activity', dashboardController.getRecentActivity);

module.exports = router;
