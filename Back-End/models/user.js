const mongoose = require('mongoose');

// User Schema -- CAN BE UPDATED AS NEEDED
const UserSchema = new mongoose.Schema(
{
    // Google Id field of a User
    googleId: 
    {
        type: String,
        required: true
    },
    // Display name field of a User
    displayName: 
    {
        type: String,
    },
    // First name field of a User
    firstName: 
    {
        type: String,
        required: true
    },
    // Last name field of a user
    lastName: 
    {
        type: String,
        required: true
    },
    // Image field of a user (Profile pic)    
    image: 
    {
        type: String
    },
    // Created at timestamps when user is created
    createdAt: 
    {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);
