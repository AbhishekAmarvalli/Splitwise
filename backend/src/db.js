const { Pool } = require('pg');
require('dotenv').config();

if (!process.env.DATABASE_URL) {
  console.error(
    '[db] DATABASE_URL is not set. Copy backend/.env.example to backend/.env and fill it in.'
  );
}

const needsSsl =
  process.env.NODE_ENV === 'production' ||
  /sslmode=require/.test(process.env.DATABASE_URL || '');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: needsSsl ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// An idle-client error should not take the whole server down; log it and let
// the pool replace the client.
pool.on('error', (err) => {
  console.error('[db] Unexpected error on idle client:', err.message);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getConnection: () => pool.connect(),
  pool,
  isConfigured: () => Boolean(process.env.DATABASE_URL),
};
