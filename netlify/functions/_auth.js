// Admin requests carry `Authorization: Bearer <session token>`, issued by
// admin-login.js after checking the shared ADMIN_PASSWORD. See
// _session.js for the token itself, and README for why this replaced
// Netlify Identity (no longer free).
import { verifySessionToken } from './_session.js';

export function requireAdmin(event) {
  const header = (event.headers && (event.headers.authorization || event.headers.Authorization)) || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!verifySessionToken(token)) {
    const err = new Error('You must be signed in as an admin to do that.');
    err.statusCode = 401;
    throw err;
  }
  return true;
}

export function jsonResponse(statusCode, data) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  };
}

export function handleError(err) {
  console.error(err);
  const statusCode = err.statusCode || 500;
  return jsonResponse(statusCode, { error: err.message || 'Something went wrong on the server.' });
}
