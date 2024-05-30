// routes/user_routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user_controller');
const { ensureAuth, ensureCorrectUser } = require('../middleware/auth');

// Search for user by first name, last name, or display name
router.get('/search', userController.searchUsers);

// Get all users - GET route
router.get('/', userController.getAllUsers);

// Get specific user by specific Id - GET route
router.get('/:id', userController.getUserById);

// Update user account, only your own
router.put('/:id', ensureAuth, ensureCorrectUser, userController.updateUser);

module.exports = router;
