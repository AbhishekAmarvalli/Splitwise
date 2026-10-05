// Vercel serverless entry.
//
// vercel.json rewrites every /api/* request to this function and passes the
// real backend path in the `__orig` query parameter (e.g.
// `/api/auth/login` -> `/api/index?__orig=/api/auth/login`). Depending on how
// Vercel evolves rewrite semantics the function may receive either the
// destination path or the original path, so we normalise both: if `__orig` is
// present it always wins, otherwise the incoming path is already correct.
//
// Socket.IO cannot run on serverless (no shared process state between
// invocations), so realtime is handled client-side with a polling fallback —
// see frontend/src/hooks/useSocket.js.

require('dotenv').config();

const app = require('../src/app');
const db = require('../src/db');
const { runMigrations } = require('../src/migrate');

// Run migrations once per function instance (idempotent, guarded against
// concurrent cold starts by IF NOT EXISTS in the migration statements).
const ready =
  global.__splitease_ready ??
  (global.__splitease_ready = (async () => {
    if (!db.isConfigured()) return;
    try {
      await runMigrations();
    } catch (err) {
      // Never take the API down over a migration hiccup — log and continue.
      console.error('[migrate] startup migration failed:', err.message);
    }
  })());

module.exports = async (req, res) => {
  await ready;

  try {
    const url = new URL(req.url, 'http://internal');
    const original = url.searchParams.get('__orig');
    if (original) {
      url.searchParams.delete('__orig');
      const rest = url.searchParams.toString();
      req.url = original + (rest ? `?${rest}` : '');
    }
  } catch (err) {
    // Malformed URL — Express will 404 it below.
  }

  return app(req, res);
};
