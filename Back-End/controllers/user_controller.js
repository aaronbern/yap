const User = require('../models/user');

// Called from routes/user_routes.js

// Get all users controller function
exports.getAllUsers = async (req, res) =>
{
    try
    {
        const users = await User.find();
        res.status(200).json(users);
    }
    catch(err)
    {
        res.status(500).json({message: err.message});        
    }
};

// Get user by Id controller function
exports.getUserById = async (req, res) => 
{
    try
    {
        const user = await User.findById(req.params.id);
        if (!user)
        {
            return res.status(404).json({ message: 'User not found'});
        }
        res.status(200).json(user);
    }
    catch (err)
    {
        res.status(500).json({message: err.message });
    }
};

// Search user by fname, lname, or display name function
exports.searchUsers = async (req, res) =>
{
    const {query } = req.query; //get search query as parameter
    try
    {
        const users = await User.find(
        {
            $or: 
            [
                {
                    firstName:  {$regex: query, $options: 'i'}
                },
                {
                    lastName:   {$regex: query, $options: 'i'}
                },
                {
                    displayName: {$regex: query, $options: 'i'}
                }
            ]
        });
        res.status(200).json(users);
    }
    catch(err)
    {
        res.status(500).json({message: err.message});
    }
};

// Update user info
exports.updateUser = async(req, res) =>
{
    try
    {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true});
        if(!user)
        {
            return res.status(404).json({message: "User not found"});          
        }
        res.status(200).json(user);
    } 
    catch (err)
    {
        res.status(500).json({message:err.message});
    }
};