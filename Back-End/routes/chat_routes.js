const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat_controller');
const { ensureAuth } = require('../middleware/auth');

// Get all chat rooms for a user
router.get('/rooms', ensureAuth, chatController.getAllChatRooms);

// Get messages for a specific chat room
router.get('/rooms/:id/messages', ensureAuth, chatController.getMessagesForChatRoom);

// Create a new chat room
router.post('/rooms', ensureAuth, chatController.createChatRoom);

// Add user to chat room
router.post('/rooms/:id/add', ensureAuth, chatController.addUserToChatRoom);

// Send a message in a chat room
router.post('/messages', ensureAuth, chatController.sendMessage);

module.exports = router;
