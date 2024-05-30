// middleware/auth.js
function ensureAuth(req, res, next) 
{
    if (req.isAuthenticated()) 
    {
        return next();
    } 
    else 
    {
        res.redirect('/');
    }
}

function ensureCorrectUser(req, res, next) 
{
    if (req.isAuthenticated() && req.user.id === req.params.id) 
    {
        return next();
    } 
    else 
    {
        res.status(403).json({ message: 'Unauthorized' });
    }
}

module.exports = { ensureAuth, ensureCorrectUser };