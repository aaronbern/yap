// middleware/auth.js
const ensureAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.status(401).json({ message: 'User not authenticated' });
    }
};

function ensureCorrectUser(req, res, next) {
    if (req.isAuthenticated() && req.user.id === req.params.id) {
        return next();
    } else {
        res.status(403).json({ message: 'Unauthorized' });
    }
}

module.exports = { ensureAuth, ensureCorrectUser };
