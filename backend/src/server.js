const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = require('./app');
const db = require('./db');
const { runMigrations } = require('./migrate');
const { getCorsOptions } = require('./utils/cors');

const server = http.createServer(app);

const io = new Server(server, {
  cors: getCorsOptions(),
});

// Make the real io accessible to routes (overrides the no-op from app.js)
app.set('io', io);

// Optionally serve the built frontend from the same origin (single-service
// deploy). When the frontend is hosted separately on Vercel the dist folder may
// not exist here, so guard on it instead of erroring on every page load.
if (process.env.NODE_ENV === 'production') {
  const express = require('express');
  const path = require('path');
  const fs = require('fs');
  const frontendDist = path.join(__dirname, '../../frontend/dist');

  if (fs.existsSync(path.join(frontendDist, 'index.html'))) {
    app.use(express.static(frontendDist));

    // SPA catch-all: serve index.html for client-side routes only.
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/') || req.path.startsWith('/socket.io')) {
        return next();
      }
      res.sendFile(path.join(frontendDist, 'index.html'));
    });
  } else {
    console.log('[server] No frontend/dist found — serving API only');
  }
}

// Socket.IO connections with authentication
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (!token) return next(new Error('Authentication required'));

  try {
    const jwt = require('jsonwebtoken');
    socket.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    next(new Error('Invalid or expired token'));
  }
});

io.on('connection', (socket) => {
  const user = socket.user;

  socket.on('join-group', async (groupId) => {
    // Only let members subscribe to a group's realtime channel.
    try {
      const { rows } = await db.query(
        'SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2',
        [groupId, user.id]
      );
      if (rows.length === 0) {
        socket.emit('error', { message: 'Not a member of this group' });
        return;
      }
      socket.join(`group-${groupId}`);
    } catch (err) {
      console.error('Socket join-group error:', err.message);
    }
  });

  socket.on('leave-group', (groupId) => {
    socket.leave(`group-${groupId}`);
  });
});

const PORT = process.env.PORT || 5000;

async function start() {
  if (db.isConfigured()) {
    try {
      await runMigrations();
      console.log('Database schema is up to date');
    } catch (err) {
      console.error('Startup migration failed:', err.message);
    }
  }

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();

module.exports = { app, server, io };
