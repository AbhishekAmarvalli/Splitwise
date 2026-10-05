const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const { getCorsOptions } = require('./utils/cors');
const authRoutes = require('./routes/auth');
const groupRoutes = require('./routes/groups');
const expenseRoutes = require('./routes/expenses');
const settlementRoutes = require('./routes/settlements');
const balanceRoutes = require('./routes/balances');

const app = express();

// Vercel/Render terminate TLS and set X-Forwarded-For in front of us. Trust
// exactly one proxy hop so req.ip (and express-rate-limit, which throws
// ERR_ERL_UNEXPECTED_X_FORWARDED_FOR otherwise) resolves to the real client.
app.set('trust proxy', 1);

// Allows the test suite (supertest) to inspect the app without a live socket server.
app.set('io', {
  to: () => ({ emit: () => {} }),
});

// Security headers. contentSecurityPolicy is disabled so the production build
// can load its Google Fonts stylesheet; CORP is cross-origin because the
// frontend lives on a different Vercel project than this API.
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Middleware
app.use(cors(getCorsOptions()));
app.use(express.json({ limit: '1mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/settlements', settlementRoutes);
app.use('/api/balances', balanceRoutes);

// Health check — used by Render/Fly health probes and uptime pings.
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Unknown API route
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
