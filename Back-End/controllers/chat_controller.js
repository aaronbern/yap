// controllers/chat_controller.js
const ChatRoom = require('../models/chat_room');
const Message = require('../models/message');
const mongoose = require('mongoose'); 
const User = require('../models/user');

// Get all chat rooms for a user
exports.getAllChatRooms = async (req, res) => 
{
    try 
    {
        const chatRooms = await ChatRoom.find({ participants: req.user._id });
        res.status(200).json(chatRooms);
    } 
    catch (err) 
    {
        console.error('Error fetching chat rooms:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Get messages for a specific chat room
exports.getMessagesForChatRoom = async (req, res) => 
{
    try 
    {
        const messages = await Message.find({ chatRoom: req.params.id }).populate('sender');
        res.status(200).json(messages);
    } 
    catch (err) 
    {
        console.error('Error fetching messages:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Create a new chat room
exports.createChatRoom = async (req, res) => 
{
    try 
    {
        const { name, participants } = req.body;
        if (!name || !participants) {
            return res.status(400).json({ message: 'Name and participants are required' });
        }
        const newChatRoom = new ChatRoom({
            name,
            participants: [req.user._id, ...participants]
        });
        await newChatRoom.save();
        res.status(201).json(newChatRoom);
    } 
    catch (err) 
    {
        console.error('Error creating chat room:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Get participants for a specific chat room
exports.getParticipants = async (req, res) => {
    try {
        const chatRoom = await ChatRoom.findById(req.params.id).populate('participants');
        if (!chatRoom) {
            return res.status(404).json({ message: 'Chat room not found' });
        }
        res.status(200).json(chatRoom.participants);
    } catch (err) {
        console.error('Error fetching participants:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Add user to chat room
exports.addUserToChatRoom = async (req, res) => {
    try {
        const chatRoom = await ChatRoom.findById(req.params.id);
        if (!chatRoom) {
            return res.status(404).json({ message: 'Chat room not found' });
        }
        chatRoom.participants.push(req.body.userId);
        await chatRoom.save();
        res.status(200).json(chatRoom);
    } catch (err) {
        console.error('Error adding user to chat room:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Send a message in a chat room
exports.sendMessage = async (req, res) => {
    try {
        const { chatRoomId, text, attachments } = req.body;
        if (!chatRoomId) {
            return res.status(400).json({ message: 'Chat room ID is required' });
        }

        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const senderId = req.user._id;

        const messageData = {
            chatRoom: new mongoose.Types.ObjectId(chatRoomId),
            sender: new mongoose.Types.ObjectId(senderId),
            text: text || '', 
            attachments: attachments || []
        };

        const message = new Message(messageData);
        await message.save();

        const populatedMessage = await Message.findById(message._id).populate('sender', 'displayName').exec();

        req.io.to(chatRoomId).emit('message', populatedMessage);

        res.status(201).json(populatedMessage);
    } catch (err) {
        console.error('Error sending message:', err);
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
};

// Rename a chat room
exports.renameChatRoom = async (req, res) => 
{
    try 
    {
        const chatRoom = await ChatRoom.findById(req.params.id);
        if (!chatRoom) 
        {
            return res.status(404).json({ message: 'Chat room not found' });
        }
        chatRoom.name = req.body.name;
        await chatRoom.save();
        res.status(200).json(chatRoom);
    } 
    catch (err) 
    {
        console.error('Error renaming chat room:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Deletes a chat room
exports.deleteChatRoom = async (req, res) => {
    try {
        const chatRoom = await ChatRoom.findById(req.params.id);
        if (!chatRoom) {
            return res.status(404).json({ message: 'Chat room not found' });
        }

        // Delete all messages in the chat room
        await Message.deleteMany({ chatRoom: req.params.id });

        // Delete the chat room
        await ChatRoom.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: 'Chat room deleted successfully' });
    } catch (err) {
        console.error('Error deleting chat room:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
