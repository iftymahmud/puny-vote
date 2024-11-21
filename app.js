// app.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const http = require('http'); 
const socketIO = require('socket.io'); 
const sharedsession = require('express-socket.io-session'); 
const Participant = require('./models/Participant');

const app = express();
const server = http.createServer(app); // Create an HTTP server
const io = socketIO(server); // Attach socket.io to the server

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
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
});

app.use(sessionMiddleware);

// Share session with Socket.IO
io.use(sharedsession(sessionMiddleware, {
  autoSave: true,
}));

// Middleware to set res.locals.user
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
  // Debugging: Log the user
  // console.log('res.locals.user:', res.locals.user);
  next();
});

// Middleware to make io accessible in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});


// Set View Engine
app.set('view engine', 'ejs');

// Routes
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const organizerRouter = require('./routes/organizer');
const questionsRouter = require('./routes/questions');
const controlPanelRouter = require('./routes/controlPanel');
const lobbyRouter = require('./routes/lobby');
const voteParticipationRouter = require('./routes/voteParticipation');

app.use('/', indexRouter);
app.use('/', lobbyRouter);
app.use('/', voteParticipationRouter);
app.use('/auth', authRouter);
app.use('/organizer', organizerRouter);
app.use('/organizer', questionsRouter);
app.use('/organizer', controlPanelRouter);



// Catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Page Not Found');
  err.status = 404;
  next(err);
});

// Global error handling middleware
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  console.error('Global error handler:', err.stack || err);
  if (err.status === 404) {
    res.render('404', { message: err.message });
  } else {
    res.render('error', { message: 'An unexpected error occurred. Please try again later.' });
  }
});

// Handle Unhandled Rejections and Uncaught Exceptions
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
  // Application-specific logging, throwing an error, or other logic here
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Application-specific logging, throwing an error, or other logic here
});




// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle joining rooms
  socket.on('joinRoom', (data) => {
    socket.join(data.room);
    console.log(`User joined room: ${data.room}`);
  });

  socket.on('chatMessage', async (data) => {
    const participant = await Participant.findById(socket.handshake.session.userId);
    if (participant) {
      const chatData = {
        name: participant.name,
        emoji: participant.emoji,
        message: data.message,
      };
      io.to(`session_${participant.code}`).emit('receiveChatMessage', chatData);
    }
  });

  // Handle disconnects
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});



// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
