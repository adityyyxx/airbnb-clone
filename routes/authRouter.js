// External Module
const express = require("express");
const authRouter = express.Router();

// Local Module
const authController = require("../controllers/authController");

const passport = require('../utils/passport-config');

authRouter.get("/login", authController.getLogin);
authRouter.post("/login", authController.postLogin);
authRouter.get("/signup", authController.getSignup);
authRouter.post("/signup", authController.postSignup);
authRouter.post("/logout", authController.postLogout);

// Google OAuth Routes
authRouter.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

authRouter.get('/auth/google/callback', (req, res, next) => {
    passport.authenticate('google', (err, user, info) => {
        if (err) {
            console.error("Passport Auth Error:", err);
            return res.redirect('/login?error=auth_failed');
        }
        if (!user) {
            return res.redirect('/login?error=no_user');
        }
        req.logIn(user, (err) => {
            if (err) {
                return res.redirect('/login');
            }
            return authController.googleAuthCallback(req, res, next);
        });
    })(req, res, next);
});

module.exports = authRouter;