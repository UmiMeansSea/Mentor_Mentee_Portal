require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const setupSocket = require('./socket/chat');

const app = express();
const server = http.createServer(app);

// The exact URL of your Vercel frontend
const CLIENT_URL = "https://mentor-mentee-portal.vercel.app";

// 1. CORS Configuration for Express
app.use(cors({
  origin: CLIENT_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 2. Explicit Pre-flight handler (Fixes persistent CORS blocks)
app.options('*', cors());

// 3. Body Parser Middleware
app.use(express.json());

// 4. Socket.io Configuration
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/mentorships', require('./routes/mentorships'));
app.use('/api/goals', require('./routes/goals'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/health', (req, res) => res.json({ 
  status: 'ok', 
  timestamp: new Date(),
  allowedOrigin: CLIENT_URL 
}));

// Socket.io Setup
setupSocket(io);

// Railway dynamic port handling
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Access granted to: ${CLIENT_URL}`);
});