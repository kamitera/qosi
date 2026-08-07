// Thin wrapper around netlify-identity-widget. Safe to import even before
// the site is connected to Netlify Identity — init() just no-ops if the
// widget can't reach an Identity endpoint (e.g. running `vite` locally
// without `netlify dev`), and the app treats that as "demo mode".
import netlifyIdentity from 'netlify-identity-widget';

let initialized = false;
let apiUrl = null;

export function initIdentity() {
  if (initialized) return;
  initialized = true;
  try {
    // When served by Netlify (or `netlify dev`), the widget auto-detects
    // the site's Identity endpoint from the page. No config needed.
    netlifyIdentity.init();
  } catch (e) {
    // Identity isn't set up yet — fine, admin screens will say so.
    console.warn('Netlify Identity did not initialize:', e.message);
  }
}

export function getCurrentUser() {
  try {
    return netlifyIdentity.currentUser();
  } catch {
    return null;
  }
}

export function getAuthToken() {
  const user = getCurrentUser();
  return user && user.token ? user.token.access_token : null;
}

export function openLogin() {
  netlifyIdentity.open('login');
}

export function logout() {
  netlifyIdentity.logout();
}

export function onAuthChange(cb) {
  netlifyIdentity.on('login', cb);
  netlifyIdentity.on('logout', cb);
  netlifyIdentity.on('init', cb);
}

export { apiUrl };
