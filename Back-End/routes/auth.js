const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth_controller');

// @desc Auth with Google
// @route GET /auth/google
router.get('/google', authController.googleAuth);

// @desc Google auth callback
// @route GET /auth/google/callback
router.get('/google/callback', authController.googleAuthCallback, authController.redirectAfterAuth);

// @desc Logout user
// @route /auth/logout
router.get('/logout', authController.logout);

module.exports = router;
