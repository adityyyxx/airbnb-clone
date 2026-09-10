// Core Module
const path = require('path');

// External Module
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const mongoose = require('mongoose');
require('dotenv').config();

const DB_PATH = "mongodb+srv://root:aditya123@keepcoding.xp3rkci.mongodb.net/?retryWrites=true&w=majority&appName=KeepCoding";

// Local Module
const storeRouter = require("./routes/storeRouter");
const hostRouter = require("./routes/hostRouter");
const authRouter = require("./routes/authRouter");
const serviceRouter = require("./routes/serviceRouter");
const experienceRouter = require("./routes/experienceRouter");
const paymentRouter = require("./routes/paymentRouter");
const rootDir = require("./utils/pathUtil");
const errorsController = require("./controllers/errors");
const passport = require('./utils/passport-config');

const app = express();

// Gzip compress all responses for faster transfers
app.use(compression());

// Serve static files FIRST — before session/auth middleware
app.use(express.static(path.join(rootDir, 'public'), {
  maxAge: '1d',
  etag: true
}));

app.set('view engine', 'ejs');
app.set('views', 'views');

// JSON parser with raw body buffer capture for Webhook HMAC signature verification
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

app.use(express.urlencoded({ extended: false }));

const store = new MongoDBStore({
  uri: process.env.MONGODB_URI || DB_PATH,
  collection: 'sessions'
});

app.use(session({
  secret: process.env.SESSION_SECRET || "KnowledgeGate AI with Complete Coding",
  resave: false,
  saveUninitialized: false,
  store
}));

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  req.isLoggedIn = req.session.isLoggedIn || false;
  req.userRole = req.session.userRole || null;
  req.userName = req.session.userName || null;
  req.userId = req.session.userId || null;
  
  // Make available to all EJS templates
  res.locals.userRole = req.userRole;
  res.locals.userName = req.userName;
  res.locals.isLoggedIn = req.isLoggedIn;
  res.locals.userId = req.userId;
  res.locals.razorpayKeyId = process.env.RAZORPAY_KEY_ID || '';
  next();
});

// Mount Routes
app.use("/api/payments", paymentRouter);
app.use(authRouter);
app.use(storeRouter);
app.use("/services", serviceRouter);
app.use("/experiences", experienceRouter);
app.use("/host", (req, res, next) => {
  if (req.isLoggedIn && req.userRole === 'admin') {
    next();
  } else if (req.isLoggedIn) {
    res.redirect("/");
  } else {
    res.redirect("/login");
  }
});
app.use("/host", hostRouter);

app.use(errorsController.pageNotFound);

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(process.env.MONGODB_URI || DB_PATH).then(() => {
    console.log('Connected to Mongo');
    app.listen(PORT, () => {
      console.log(`Server running on address http://localhost:${PORT}`);
    });
  }).catch(err => {
    console.log('Error while connecting to Mongo: ', err);
  });
}

module.exports = app;