const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
require('dotenv').config();
require('./config/passport'); 

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express session
app.use(session(
{
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false, // Ensure uninitialized sessions are not saved
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }), // Use MongoDB to store sessions
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day session expiration
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Database connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/users', require('./routes/user_routes'));

// Dashboard route
// Using for now to test auth, could use for a profile page or something. Or the main menu dashboard
app.get('/dashboard', (req, res) =>
{
    if (req.isAuthenticated())
    {
        res.send(`Hello, ${req.user.displayName}`);
    }
    else
    {
        res.redirect('/');
    }
});

// Home route
app.get('/', (req, res) =>
{
    res.send('Yap Chat Application');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
{
    console.log(`Server running on port ${PORT}`);
});
