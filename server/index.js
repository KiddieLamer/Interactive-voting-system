const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const voteRoutes = require('./routes/vote');
const adminRoutes = require('./routes/admin');
const devRoutes = require('./routes/dev');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3010",
    methods: ["GET", "POST"]
  }
});

app.use(helmet());
app.use(cors());
app.use(express.json());

// Trust proxy for rate limiting
app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

const voteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1
});

app.use('/api/auth', authRoutes);
app.use('/api/vote', voteLimiter, voteRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dev', devRoutes);

const votes = {};
const activeVoters = new Set();
const otpStore = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-voting', () => {
    socket.emit('vote-update', votes);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

global.io = io;
global.votes = votes;
global.activeVoters = activeVoters;
global.otpStore = otpStore;

const PORT = process.env.PORT || 3011;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔒 Secure voting system ready!`);
});