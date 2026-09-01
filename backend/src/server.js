const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = require('./app');
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Make real io accessible to routes (overrides mock)
app.set('io', io);

// Serve static frontend in production
if (process.env.NODE_ENV === 'production') {
  const express = require('express');
  const path = require('path');
  const frontendDist = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendDist));
  // SPA catch-all: only serve index.html for non-API routes
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Socket.IO connections
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-group', (groupId) => {
    socket.join(`group-${groupId}`);
    console.log(`Socket ${socket.id} joined group-${groupId}`);
  });

  socket.on('leave-group', (groupId) => {
    socket.leave(`group-${groupId}`);
    console.log(`Socket ${socket.id} left group-${groupId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, io };
