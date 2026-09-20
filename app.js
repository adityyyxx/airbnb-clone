// Core Module
const path = require('path');

// External Module
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

// Local Module
const storeRouter = require("./routes/storeRouter");
const hostRouter = require("./routes/hostRouter");
const authRouter = require("./routes/authRouter");
const serviceRouter = require("./routes/serviceRouter");
const experienceRouter = require("./routes/experienceRouter");
const paymentRouter = require("./routes/paymentRouter");
const hostController = require("./controllers/hostController");
const rootDir = require("./utils/pathUtil");
const errorsController = require("./controllers/errors");
const passport = require('./utils/passport-config');

const { performance } = require('perf_hooks');

const app = express();

const crypto = require('crypto');

// Top-level request timing & debugging middleware for GET /
app.use((req, res, next) => {
  const reqId = crypto.randomBytes(3).toString('hex');
  req._reqId = reqId;
  req._startTime = performance.now();
  req._middlewareTimings = [];

  const timestamp = new Date().toISOString();
  const referer = req.headers['referer'] || req.headers['referrer'] || 'none';
  const userAgent = req.headers['user-agent'] || 'none';
  const secFetchDest = req.headers['sec-fetch-dest'] || 'unknown';
  const secFetchMode = req.headers['sec-fetch-mode'] || 'unknown';
  const secFetchSite = req.headers['sec-fetch-site'] || 'unknown';
  const secPurpose = req.headers['sec-purpose'] || req.headers['purpose'] || 'none';

  let navType = 'Browser Navigation';
  if (secPurpose.toLowerCase().includes('prefetch') || secPurpose.toLowerCase().includes('prerender')) {
    navType = `Prefetch/Prerender (${secPurpose})`;
  } else if (secFetchDest !== 'document' && secFetchDest !== 'unknown') {
    navType = `Resource Request (${secFetchDest})`;
  } else if (secFetchMode === 'cors' || req.xhr) {
    navType = 'AJAX / Fetch Request';
  } else if (userAgent.toLowerCase().includes('render') || userAgent.toLowerCase().includes('curl') || userAgent.toLowerCase().includes('uptime') || userAgent.toLowerCase().includes('health')) {
    navType = 'HealthCheck / Proxy / Bot';
  }

  if (req.path === '/' && req.method === 'GET') {
    console.log(`\n🔵 REQUEST START`);
    console.log(`ID: ${reqId}`);
    console.log(`TIME: ${timestamp}`);
    console.log(`METHOD: ${req.method}`);
    console.log(`URL: ${req.originalUrl || req.url}`);
    console.log(`REFERER: ${referer}`);
    console.log(`USER-AGENT: ${userAgent}`);
    console.log(`DESTINATION: ${secFetchDest} | MODE: ${secFetchMode} | SITE: ${secFetchSite}`);
    console.log(`NAVIGATION TYPE: ${navType}`);
  }

  // Instrument res.redirect to log any redirect targeted at / or originating from /
  const originalRedirect = res.redirect.bind(res);
  res.redirect = function(url) {
    let target = url;
    if (typeof url === 'number') {
      target = arguments[1];
    }
    if (target === '/' || req.path === '/') {
      console.log(`🔀 REDIRECT TRIGGERED [Req ID ${reqId}]: From "${req.originalUrl || req.url}" to "${target}" (Referer: ${referer})`);
    }
    return originalRedirect.apply(this, arguments);
  };

  // Log request end when response finishes
  res.on('finish', () => {
    if (req.path === '/' && req.method === 'GET') {
      const totalMs = (performance.now() - req._startTime).toFixed(2);
      console.log(`🔴 REQUEST END`);
      console.log(`ID: ${reqId}`);
      console.log(`STATUS: ${res.statusCode}`);
      console.log(`TOTAL: ${totalMs} ms\n`);
    }
  });

  next();
});

// Helper function to instrument middleware execution
const trackMiddleware = (name, middlewareFn) => {
  return (req, res, next) => {
    const start = performance.now();
    middlewareFn(req, res, (err) => {
      const duration = performance.now() - start;
      if (req.path === '/' && req.method === 'GET') {
        req._middlewareTimings = req._middlewareTimings || [];
        req._middlewareTimings.push({ name, duration });
      }
      next(err);
    });
  };
};

// Gzip compress all responses for faster transfers
app.use(trackMiddleware('Compression middleware', compression()));

// Serve static files FIRST — before session/auth middleware
app.use(trackMiddleware('Static files middleware', express.static(path.join(rootDir, 'public'), {
  maxAge: '1d',
  etag: true
})));

app.set('view engine', 'ejs');
app.set('views', 'views');

// JSON parser with raw body buffer capture for Webhook HMAC signature verification
app.use(trackMiddleware('JSON parser middleware', express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
})));

app.use(trackMiddleware('Urlencoded parser middleware', express.urlencoded({ extended: false })));

// Production-ready Health Check Endpoint (unauthenticated, lightweight, zero session/auth overhead)
app.get('/health', (req, res) => {
  try {
    const isDbConnected = mongoose.connection && mongoose.connection.readyState === 1;

    if (isDbConnected) {
      return res.status(200).json({
        status: "ok",
        database: "connected"
      });
    }

    return res.status(503).json({
      status: "error",
      database: "disconnected"
    });
  } catch (error) {
    return res.status(503).json({
      status: "error",
      database: "disconnected"
    });
  }
});

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

store.on('error', function(error) {
  console.error('MongoDB Session Store Error:', error);
});

app.use(trackMiddleware('Session middleware', session({
  secret: process.env.SESSION_SECRET || "KnowledgeGate AI with Complete Coding",
  resave: false,
  saveUninitialized: false,
  store,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  }
})));

app.use(trackMiddleware('Passport initialize', passport.initialize()));
app.use(trackMiddleware('Passport session', passport.session()));

app.use((req, res, next) => {
  const start = performance.now();
  const passportUser = req.user;
  req.isLoggedIn = (req.session && req.session.isLoggedIn) || Boolean(req.isAuthenticated && req.isAuthenticated()) || false;
  req.userRole = (req.session && req.session.userRole) || (passportUser && passportUser.role) || null;
  req.userName = (req.session && req.session.userName) || (passportUser && (passportUser.username || passportUser.name)) || null;
  req.userId = (req.session && req.session.userId) || (passportUser && (passportUser._id || passportUser.id)) || null;
  
  // Make available to all EJS templates
  res.locals.userRole = req.userRole;
  res.locals.userName = req.userName;
  res.locals.isLoggedIn = req.isLoggedIn;
  res.locals.userId = req.userId;
  res.locals.razorpayKeyId = process.env.RAZORPAY_KEY_ID || '';

  const duration = performance.now() - start;
  if (req.path === '/' && req.method === 'GET') {
    req._middlewareTimings = req._middlewareTimings || [];
    req._middlewareTimings.push({ name: 'Locals setup', duration });
    req._middlewareEndTime = performance.now();
  }
  next();
});

// Mount Routes
app.use("/api/payments", paymentRouter);
app.use(authRouter);
app.use(storeRouter);
app.use("/services", serviceRouter);
app.use("/experiences", experienceRouter);

// /admin authentication & authorization middleware
app.use("/admin", (req, res, next) => {
  if (!req.isLoggedIn) {
    return res.status(401).send("401 Unauthorized: Please log in.");
  }
  if (req.userRole !== 'admin') {
    return res.status(403).send("403 Forbidden: Admin access required.");
  }
  next();
});
app.get("/admin", hostController.getHostHomes);

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

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled Application Error:", err);
  if (res.headersSent) {
    return next(err);
  }
  const isAjax = req.xhr || req.headers.accept?.includes('application/json') || req.path?.startsWith('/api/');
  if (isAjax) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal Server Error'
    });
  }
  res.status(err.status || 500).render("404", {
    pageTitle: "Error Occurred",
    currentPage: "error",
    isLoggedIn: req.isLoggedIn || false
  });
});

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  if (!MONGODB_URI) {
    console.error('FATAL: MONGODB_URI is not defined in environment variables.');
    process.exit(1);
  }
  mongoose.connect(MONGODB_URI).then(() => {
    console.log('Connected to Mongo');
    app.listen(PORT, () => {
      console.log(`Server running on address http://localhost:${PORT}`);
    });
  }).catch(err => {
    console.log('Error while connecting to Mongo: ', err);
  });
}

module.exports = app;