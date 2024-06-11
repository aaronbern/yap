// config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');

passport.serializeUser((user, done) => {
    done(null, user.id); // Serialize the user ID to save in the session store
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id); // Find the user by ID and return the user object
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

passport.use(new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.NODE_ENV === 'production'
            ? 'https://yapp-chat-app-de1a44a0cf7e.herokuapp.com/auth/google/callback'
            : 'http://localhost:5000/auth/google/callback'
    },
    async (token, tokenSecret, profile, done) => {
        try {
            let user = await User.findOne({ googleId: profile.id });

            if (!user) {
                user = new User({
                    googleId: profile.id,
                    displayName: profile.displayName,
                    firstName: profile.name.givenName,
                    lastName: profile.name.familyName,
                    image: profile.photos[0].value
                });

                await user.save();
            }

            done(null, user);
        } catch (err) {
            done(err, null);
        }
    }
));
