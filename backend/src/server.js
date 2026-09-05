const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = require('./app');
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? process.env.FRONTEND_URL
      : ['http://localhost:5173', 'http://localhost:5000'],
    methods: ['GET', 'POST'],
    credentials: true,
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

// Socket.IO connections with authentication
io.on('connection', (socket) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  let user = null;

  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      user = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Authenticated socket:', socket.id, 'user:', user.id);
    } catch (err) {
      console.log('Invalid socket token:', socket.id);
      socket.disconnect();
      return;
    }
  } else {
    console.log('No token provided, disconnecting:', socket.id);
    socket.disconnect();
    return;
  }

  socket.on('join-group', async (groupId) => {
    // Verify user is a member of this group
    const db = require('./db');
    try {
      const [membership] = await db.query(
        'SELECT id FROM group_members WHERE group_id = ? AND user_id = ?',
        [groupId, user.id]
      );
      if (membership.length === 0) {
        socket.emit('error', { message: 'Not a member of this group' });
        return;
      }
      socket.join(`group-${groupId}`);
      console.log(`Socket ${socket.id} (user ${user.id}) joined group-${groupId}`);
    } catch (err) {
      console.error('Socket join-group error:', err);
    }
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
