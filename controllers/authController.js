const bcrypt = require('bcryptjs');
const User = require('../models/user');

exports.getLogin = (req, res, next) => {
  let errorMessage = null;
  if (req.query.error === 'auth_failed') {
    errorMessage = 'Google authentication was cancelled or failed. Please try again.';
  } else if (req.query.error === 'no_user') {
    errorMessage = 'No user profile was returned by Google. Please try again.';
  }

  res.render("auth/login", {
    pageTitle: "Login",
    currentPage: "login",
    isLoggedIn: false,
    userRole: null,
    userName: null,
    errorMessage
  });
};

exports.postLogin = (req, res, next) => {
  const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!username || !password) {
    return res.render("auth/login", {
      pageTitle: "Login",
      currentPage: "login",
      isLoggedIn: false,
      userRole: null,
      userName: null,
      errorMessage: "Please enter both your username/email and password."
    });
  }

  const cleanUsername = username.trim();
  const usernameRegex = new RegExp('^' + cleanUsername.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i');

  User.findOne({ 
    $or: [
      { username: usernameRegex }, 
      { email: usernameRegex }
    ] 
  }).then(user => {
    if (!user) {
      return res.render("auth/login", {
        pageTitle: "Login",
        currentPage: "login",
        isLoggedIn: false,
        userRole: null,
        userName: null,
        errorMessage: "No account found with that username or email."
      });
    }

    if (!user.password) {
      return res.render("auth/login", {
        pageTitle: "Login",
        currentPage: "login",
        isLoggedIn: false,
        userRole: null,
        userName: null,
        errorMessage: "This account was registered using Google Sign-In. Please click 'Continue with Google'."
      });
    }

    bcrypt.compare(password, user.password).then(isMatch => {
      if (!isMatch) {
        return res.render("auth/login", {
          pageTitle: "Login",
          currentPage: "login",
          isLoggedIn: false,
          userRole: null,
          userName: null,
          errorMessage: "Incorrect password. Please try again."
        });
      }

      req.session.isLoggedIn = true;
      req.session.userId = user._id;
      req.session.userRole = user.role;
      req.session.userName = user.username;
      req.session.save((err) => {
        if (err) console.error("Session save error:", err);
        res.redirect("/");
      });
    }).catch(compareErr => {
      console.error("Password comparison error:", compareErr);
      res.render("auth/login", {
        pageTitle: "Login",
        currentPage: "login",
        isLoggedIn: false,
        userRole: null,
        userName: null,
        errorMessage: "An error occurred while verifying credentials. Please try again."
      });
    });
  }).catch(err => {
    console.error("Login database error: ", err);
    res.render("auth/login", {
      pageTitle: "Login",
      currentPage: "login",
      isLoggedIn: false,
      userRole: null,
      userName: null,
      errorMessage: "An unexpected error occurred. Please try again later."
    });
  });
};

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    pageTitle: "Sign Up",
    currentPage: "signup",
    isLoggedIn: false,
    userRole: null,
    userName: null,
    errorMessage: null
  });
};

exports.postSignup = (req, res, next) => {
  const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
  const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  const confirmPassword = typeof req.body?.confirmPassword === 'string' ? req.body.confirmPassword : '';

  if (!username || !email || !password) {
    return res.render("auth/signup", {
      pageTitle: "Sign Up",
      currentPage: "signup",
      isLoggedIn: false,
      userRole: null,
      userName: null,
      errorMessage: "All fields are required."
    });
  }

  if (confirmPassword && password !== confirmPassword) {
    return res.render("auth/signup", {
      pageTitle: "Sign Up",
      currentPage: "signup",
      isLoggedIn: false,
      userRole: null,
      userName: null,
      errorMessage: "Passwords do not match."
    });
  }

  if (password.length < 4) {
    return res.render("auth/signup", {
      pageTitle: "Sign Up",
      currentPage: "signup",
      isLoggedIn: false,
      userRole: null,
      userName: null,
      errorMessage: "Password must be at least 4 characters."
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.render("auth/signup", {
      pageTitle: "Sign Up",
      currentPage: "signup",
      isLoggedIn: false,
      userRole: null,
      userName: null,
      errorMessage: "Please enter a valid email address."
    });
  }

  // Check username and email separately for clearer error messages
  User.findOne({ username: username.toLowerCase() })
    .then(existingUserByName => {
      if (existingUserByName) {
        return res.render("auth/signup", {
          pageTitle: "Sign Up",
          currentPage: "signup",
          isLoggedIn: false,
          userRole: null,
          userName: null,
          errorMessage: "This username is already taken. Please choose a different one."
        });
      }

      return User.findOne({ email: email.toLowerCase() }).then(existingUserByEmail => {
        if (existingUserByEmail) {
          return res.render("auth/signup", {
            pageTitle: "Sign Up",
            currentPage: "signup",
            isLoggedIn: false,
            userRole: null,
            userName: null,
            errorMessage: "An account with this email already exists."
          });
        }

        return bcrypt.hash(password, 12).then(hashedPassword => {
          const user = new User({
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            password: hashedPassword,
            role: 'user'
          });
          return user.save();
        }).then(user => {
          req.session.isLoggedIn = true;
          req.session.userId = user._id;
          req.session.userRole = user.role;
          req.session.userName = user.username;
          req.session.save((saveErr) => {
            if (saveErr) console.error("Session save error on signup:", saveErr);
            res.redirect("/");
          });
        });
      });
    }).catch(err => {
      console.error("Signup error: ", err);
      res.render("auth/signup", {
        pageTitle: "Sign Up",
        currentPage: "signup",
        isLoggedIn: false,
        userRole: null,
        userName: null,
        errorMessage: "An error occurred during signup. Please try again."
      });
    });
};

exports.postLogout = (req, res, next) => {
  const performDestroy = () => {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) console.error("Session destruction error:", err);
        res.clearCookie('connect.sid');
        res.redirect("/");
      });
    } else {
      res.clearCookie('connect.sid');
      res.redirect("/");
    }
  };

  if (typeof req.logout === 'function') {
    req.logout((err) => {
      if (err) console.error("Passport logout error:", err);
      performDestroy();
    });
  } else {
    performDestroy();
  }
};

exports.googleAuthCallback = (req, res, next) => {
  const user = req.user;
  if (!user) {
    return res.redirect("/login?error=auth_failed");
  }

  req.session.isLoggedIn = true;
  req.session.userId = user._id;
  req.session.userRole = user.role;
  req.session.userName = user.username;
  
  req.session.save((err) => {
    if (err) console.error("Session save error on Google auth:", err);
    res.redirect("/");
  });
};
