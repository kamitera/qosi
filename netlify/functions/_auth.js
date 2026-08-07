// Netlify automatically verifies the Identity JWT sent in the
// Authorization header on requests to /.netlify/functions/* and, if valid,
// populates context.clientContext.user. The frontend (src/identity.js)
// attaches that header on every admin request.

export function getAdminUser(context) {
  return (context && context.clientContext && context.clientContext.user) || null;
}

export function requireAdmin(context) {
  const user = getAdminUser(context);
  if (!user) {
    const err = new Error('You must be signed in as an admin to do that.');
    err.statusCode = 401;
    throw err;
  }
  return user;
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
