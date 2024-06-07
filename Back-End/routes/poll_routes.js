const express = require('express');
const router = express.Router();
const Poll = require('../models/polls');
const { ensureAuth } = require('../middleware/auth');

// Create a new poll
router.post('/', ensureAuth, async (req, res) => {
    const { question, options, chatRoom } = req.body;
    const pollOptions = options.map(option => ({ text: option, votes: 0 }));
    const poll = new Poll({ question, options: pollOptions, chatRoom });
    try {
        const savedPoll = await poll.save();
        res.status(201).json(savedPoll);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create poll' });
    }
});

// Get all polls for a chat room
router.get('/:chatRoomId', ensureAuth, async (req, res) => {
    try {
        const polls = await Poll.find({ chatRoom: req.params.chatRoomId });
        res.status(200).json(polls);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch polls' });
    }
});

// Vote in a poll
router.post('/vote/:pollId', ensureAuth, async (req, res) => {
    const { optionIndex, previousOptionIndex } = req.body;
    try {
        const poll = await Poll.findById(req.params.pollId);
        if (poll && poll.options[optionIndex]) {
            // Decrement the previous option's vote count if changing vote
            if (previousOptionIndex !== undefined && previousOptionIndex !== -1 && poll.options[previousOptionIndex]) {
                poll.options[previousOptionIndex].votes -= 1;
            }
            // Increment the new option's vote count
            if (optionIndex !== -1) {
                poll.options[optionIndex].votes += 1;
            }
            await poll.save();
            res.status(200).json(poll);
        } else {
            res.status(404).json({ error: 'Poll or option not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to vote' });
    }
});

// Delete a poll
router.delete('/:pollId', ensureAuth, async (req, res) => {
    try {
        await Poll.findByIdAndDelete(req.params.pollId);
        res.status(200).json({ message: 'Poll deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete poll' });
    }
});


module.exports = router;
