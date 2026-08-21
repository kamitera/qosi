// A deliberately minimal admin session — one shared password (see
// netlify/functions/admin-login.js and _session.js), not per-person named
// accounts. This replaced Netlify Identity after Netlify moved it behind a
// paid plan. The session token lives in localStorage and is attached as
// `Authorization: Bearer <token>` on admin API calls (see src/api.js).

const TOKEN_KEY = 'admin_session_token';

export async function loginAdmin(password) {
  const res = await fetch('/.netlify/functions/admin-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  let data = {};
  try {
    data = await res.json();
  } catch {
    /* ignore */
  }
  if (!res.ok || !data.token) {
    throw new Error(data.error || 'Login failed.');
  }
  localStorage.setItem(TOKEN_KEY, data.token);
}

export function logoutAdmin() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getAdminToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function isAdminLoggedIn() {
  return !!getAdminToken();
}
