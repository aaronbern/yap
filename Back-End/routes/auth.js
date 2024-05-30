const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth_controller');
const { ensureAuth } = require('../middleware/auth');

// @desc Auth with Google
// @route GET /auth/google
router.get('/google', authController.googleAuth);

// @desc Google auth callback
// @route GET /auth/google/callback
router.get('/google/callback', authController.googleAuthCallback, authController.redirectAfterAuth);

// @desc Logout user
// @route GET /auth/logout
router.get('/logout', ensureAuth, authController.logout);

// @desc Get current authenticated user
// @route GET /auth/user
router.get('/user', authController.getUser);

module.exports = router;
