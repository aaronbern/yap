const passport = require('passport');

exports.googleAuth = passport.authenticate('google', { scope: ['profile'] });

exports.googleAuthCallback = passport.authenticate('google', { failureRedirect: '/' });

exports.redirectAfterAuth = (req, res) => {
    res.redirect('/dashboard');
};

exports.logout = (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
};

exports.getUser = (req, res) => {
    if (req.isAuthenticated()) {
        res.json(req.user);
    } else {
        res.status(401).json({ message: 'Not authenticated' });
    }
};
