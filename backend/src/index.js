require('dotenv').config();
const express = require('express');
const cors = require('cors'); // This now works because it's in package.json!
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Your specific Vercel URL
const CLIENT_URL = "https://mentor-mentee-portal.vercel.app";

// 1. Apply CORS Middleware
app.use(cors({
  origin: CLIENT_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 2. Handle Pre-flight requests
app.options('*', cors());

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/mentorships', require('./routes/mentorships'));
app.use('/api/goals', require('./routes/goals'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/admin', require('./routes/admin'));

// Health check (Railway uses this to see if your app is up)
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// 3. Railway Port Logic
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});