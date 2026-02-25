// Core Module
const path = require('path');

// External Module
const express = require('express');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const DB_PATH = "mongodb+srv://root:aditya123@keepcoding.xp3rkci.mongodb.net/?retryWrites=true&w=majority&appName=KeepCoding";

//Local Module
const storeRouter = require("./routes/storeRouter")
const hostRouter = require("./routes/hostRouter")
const authRouter = require("./routes/authRouter")
const serviceRouter = require("./routes/serviceRouter")
const experienceRouter = require("./routes/experienceRouter")
const rootDir = require("./utils/pathUtil");
const errorsController = require("./controllers/errors");
const { default: mongoose } = require('mongoose');

const app = express();
require('dotenv').config();
const passport = require('./utils/passport-config');

app.set('view engine', 'ejs');
app.set('views', 'views');

const store = new MongoDBStore({
  uri: process.env.MONGODB_URI || DB_PATH,
  collection: 'sessions'
});

app.use(express.urlencoded());
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
  // Make available to all EJS templates
  res.locals.userRole = req.userRole;
  res.locals.userName = req.userName;
  res.locals.isLoggedIn = req.isLoggedIn;
  next();
})

app.use(authRouter)
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

app.use(express.static(path.join(rootDir, 'public')))

app.use(errorsController.pageNotFound);

const PORT = process.env.PORT || 3000;

mongoose.connect(DB_PATH).then(() => {
  console.log('Connected to Mongo');
  app.listen(PORT, () => {
    console.log(`Server running on address http://localhost:${PORT}`);
  });
}).catch(err => {
  console.log('Error while connecting to Mongo: ', err);
});