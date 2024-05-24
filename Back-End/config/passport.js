const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');

//will need to change callback url on remote host
passport.use(new GoogleStrategy(
{
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) =>
{
    try
    {
        let user = await User.findOne({ googleId: profile.id });
        if (user)
        {
            return done(null, user);
        }
        else
        {
            user = new User(
            {
                googleId: profile.id,
                displayName: profile.displayName,
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                image: profile.photos[0].value
            });
            await user.save();
            return done(null, user);
        }
    }
    catch (err)
    {
        return done(err);
    }
}));

passport.serializeUser((user, done) =>
{
    done(null, user.id);
});

passport.deserializeUser(async (id, done) =>
{
    try
    {
        const user = await User.findById(id);
        done(null, user);
    }
    catch (err)
    {
        done(err, null);
    }
});
