/**
 * Builds Socket.IO / Express CORS options from FRONTEND_URL.
 *
 * FRONTEND_URL may be a comma-separated list, e.g.
 *   FRONTEND_URL="https://app.example.com,https://staging.example.com"
 *
 * When it is not set we allow every origin — this is the safe default for a
 * single-service deploy where the API serves the built frontend on the same
 * origin (and for local development).
 */
function getAllowedOrigins() {
  return (process.env.FRONTEND_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function corsOrigin(origin, callback) {
  const allowed = getAllowedOrigins();

  // No Origin header (same-origin, curl, server-to-server) is always allowed.
  if (!origin) return callback(null, true);

  // Unconfigured -> allow all so a fresh free-tier deploy works out of the box.
  if (allowed.length === 0) return callback(null, true);

  return callback(null, allowed.includes(origin));
}

function getCorsOptions() {
  return { origin: corsOrigin, credentials: true };
}

module.exports = { getCorsOptions, getAllowedOrigins };
