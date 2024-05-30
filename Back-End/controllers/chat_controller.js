const ChatRoom = require('../models/chat_room');
const Message = require('../models/message');
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
        res.status(500).json({ message: err.message });
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
        res.status(500).json({ message: err.message });
    }
};

// Create a new chat room
exports.createChatRoom = async (req, res) => 
{
    try 
    {
        const { name, participants } = req.body;
        const newChatRoom = new ChatRoom({
            name,
            participants: [req.user._id, ...participants]
        });
        await newChatRoom.save();
        res.status(201).json(newChatRoom);
    } 
    catch (err) 
    {
        res.status(500).json({ message: err.message });
    }
};

// Add user to chat room
exports.addUserToChatRoom = async (req, res) => 
{
    try 
    {
        const chatRoom = await ChatRoom.findById(req.params.id);
        if (!chatRoom) 
        {
            return res.status(404).json({ message: 'Chat room not found' });
        }
        chatRoom.participants.push(req.body.userId);
        await chatRoom.save();
        res.status(200).json(chatRoom);
    } 
    catch (err) 
    {
        res.status(500).json({ message: err.message });
    }
};

// Send a message in a chat room
exports.sendMessage = async (req, res) => 
{
    try 
    {
        const { chatRoomId, text } = req.body;
        const message = new Message({
            chatRoom: chatRoomId,
            sender: req.user._id,
            text
        });
        await message.save();
        res.status(201).json(message);
    } 
    catch (err) 
    {
        res.status(500).json({ message: err.message });
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
        await chatRoom.remove();

        res.status(200).json({ message: 'Chat room deleted successfully' });
    } catch (err) {
        console.error('Error deleting chat room:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};