//Authentication Controller
const passport = require('passport');

exports.googleAuth = passport.authenticate('google', { scope: ['profile'] });

exports.googleAuthCallback = (req, res, next) =>
{
    passport.authenticate('google', { failureRedirect: '/' })(req, res, next);
};

exports.redirectAfterAuth = (req, res) =>
{
    res.redirect('/dashboard');
};

exports.logout = (req, res) =>
{
    req.logout(() =>
    {
        res.redirect('/');
    });
};