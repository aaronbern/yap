// routes/user_routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user_controller');
const { ensureAuth, ensureCorrectUser } = require('../middleware/auth');

// Get all users - GET route
// Sent to user_controller.js - getAllUsers()
router.get('/', userController.getAllUsers);

// Get specific user by specific Id - GET route
// Sent to user_controller.js - getUserById()
router.get('/:id', userController.getUserById)

// Search for user by first name, last name, or display name
// GET route
// Sent to user_controller.js - searchUsers()
router.get('/search', userController.searchUsers);

// Update user account, only your own
// PUT route
// Sent to user_controller.js - updateUser()
router.get('/:id', ensureAuth, ensureCorrectUser, userController.updateUser);

module.exports = router;