// app.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const app = express();

// Database Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Check connection
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Session Middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  })
);

//Middleware
app.use(async (req, res, next) => {
  res.locals.user = null;
  if (req.session.userId) {
    try {
      const User = require('./models/User');
      const user = await User.findById(req.session.userId);
      res.locals.user = user;
    } catch (error) {
      console.error(error);
    }
  }
  next();
});

// Set View Engine
app.set('view engine', 'ejs');

// Routes
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const organizerRouter = require('./routes/organizer');
const questionsRouter = require('./routes/questions');
const controlPanelRouter = require('./routes/controlPanel')
const lobby = require('./routes/lobby');

app.use('/', indexRouter);
app.use('/', lobby);
app.use('/auth', authRouter);
app.use('/organizer', organizerRouter);
app.use('/organizer', questionsRouter);
app.use('/organizer', controlPanelRouter);

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
