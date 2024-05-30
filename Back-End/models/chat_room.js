// models/chat_room.js
const mongoose = require('mongoose');

// Chat Room Schema -- WIP
const ChatRoomSchema = new mongoose.Schema(
{
    // String for a name field of Chatroom
    name:
    {
        type: String,
        required: true
    },
    // User references array of participants in Chatroom
    participants:
    [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    // Created at timestamp for Chatroom creation
    createdAt:
    {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ChatRoom', ChatRoomSchema)