const bcrypt = require('bcryptjs');
const User = require('../models/user');

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    pageTitle: "Login",
    currentPage: "login",
    isLoggedIn: false,
    userRole: null,
    userName: null,
    errorMessage: null
  });
};

exports.postLogin = (req, res, next) => {
  const { username, password } = req.body;

  User.findOne({ 
    $or: [
      { username: username.toLowerCase() }, 
      { email: username.toLowerCase() }
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
      req.session.save(() => {
        res.redirect("/");
      });
    });
  }).catch(err => {
    console.log("Login error: ", err);
    res.redirect("/login");
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
  const { username, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
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
        req.session.save(() => {
          res.redirect("/");
        });
      });
      });
    }).catch(err => {
      console.log("Signup error: ", err);
      res.redirect("/signup");
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
};

exports.googleAuthCallback = (req, res, next) => {
    // Passport adds the user object to req.user after successful authentication
    const user = req.user;
    
    req.session.isLoggedIn = true;
    req.session.userId = user._id;
    req.session.userRole = user.role;
    req.session.userName = user.username;
    
    req.session.save(() => {
        res.redirect("/");
    });
};
