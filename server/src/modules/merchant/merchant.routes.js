const express = require('express');
const router = express.Router();
const merchantController = require('./merchant.controller');
const { 
  validateUpdateProfile, 
  validateWhitelistIPs, 
  validateChangePassword 
} = require('./merchant.validator');
const authMiddleware = require('../../shared/middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// Profile management
router.get('/profile', merchantController.getProfile);
router.put('/profile', validateUpdateProfile, merchantController.updateProfile);

// API Keys
router.get('/api-keys', merchantController.getAPIKeys);
router.post('/api-keys/rotate', merchantController.rotateSecretKey);

// IP Whitelist
router.put('/whitelist-ips', validateWhitelistIPs, merchantController.updateWhitelistIPs);

// Password
router.post('/change-password', validateChangePassword, merchantController.changePassword);

module.exports = router;
