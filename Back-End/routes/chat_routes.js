const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat_controller');
const { ensureAuth } = require('../middleware/auth');

// Send a message in a chat room
router.post('/messages', ensureAuth, chatController.sendMessage);

// Get all chat rooms for a user
router.get('/rooms', ensureAuth, chatController.getAllChatRooms);

// Create a new chat room
router.post('/rooms', ensureAuth, chatController.createChatRoom);

// Get messages for a specific chat room
router.get('/rooms/:id/messages', ensureAuth, chatController.getMessagesForChatRoom);


// Add user to chat room
router.post('/rooms/:id/add', ensureAuth, chatController.addUserToChatRoom);

// Delete chat room route
router.delete('/:id', ensureAuth, chatController.deleteChatRoom);

module.exports = router;
