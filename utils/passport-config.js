const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');
require('dotenv').config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user already exists
        let user = await User.findOne({ googleId: profile.id });
        
        if (user) {
            return done(null, user);
        }

        // If not, check if email exists from standard signup
        user = await User.findOne({ email: profile.emails[0].value.toLowerCase() });
        
        if (user) {
            // Link Google ID to existing email account
            user.googleId = profile.id;
            await user.save();
            return done(null, user);
        }

        // Create new user
        user = new User({
            googleId: profile.id,
            username: profile.displayName.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000),
            email: profile.emails[0].value.toLowerCase(),
            role: 'user'
        });
        await user.save();
        done(null, user);
    } catch (err) {
        done(err, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then(user => {
        done(null, user);
    }).catch(err => {
        done(err, null);
    });
});

module.exports = passport;
