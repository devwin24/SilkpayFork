const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { validateLogin, validateForgotPassword, validateResetPassword } = require('./auth.validator');

// Public routes (no auth required)
router.post('/login', validateLogin, authController.login);
router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);
router.post('/reset-password', validateResetPassword, authController.resetPassword);

module.exports = router;
