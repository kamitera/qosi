import { jsonResponse, handleError } from './_auth.js';
import { createSessionToken } from './_session.js';

// POST /.netlify/functions/admin-login  { password }  ->  { token }
export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return jsonResponse(405, { error: 'Method not allowed' });
  try {
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected) {
      return jsonResponse(500, { error: 'This site has no ADMIN_PASSWORD set yet — see the README.' });
    }
    const body = JSON.parse(event.body || '{}');
    if (body.password !== expected) {
      return jsonResponse(401, { error: 'Incorrect password.' });
    }
    return jsonResponse(200, { token: createSessionToken() });
  } catch (err) {
    return handleError(err);
  }
};
