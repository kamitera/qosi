// A deliberately minimal admin session scheme — one shared password (not
// per-person accounts), stored server-side only, with a signed token so a
// visitor can't just forge one. This replaces Netlify Identity, which
// stopped being available on Netlify's free tier — see README.
//
// Not meant to be bank-grade: there's one password for all admins, and no
// rate-limiting on login attempts. Proportionate for gating a brochure
// template editor, not for anything handling money or sensitive records.
import crypto from 'node:crypto';

const SESSION_DAYS = 30;

function secret() {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s) throw new Error('Server is missing ADMIN_SESSION_SECRET — see the README.');
  return s;
}

export function createSessionToken() {
  const payload = { exp: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000 };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', secret()).update(payloadB64).digest('base64url');
  return `${payloadB64}.${sig}`;
}

export function verifySessionToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return false;
  const [payloadB64, sig] = token.split('.');
  if (!payloadB64 || !sig) return false;
  let expectedSig;
  try {
    expectedSig = crypto.createHmac('sha256', secret()).update(payloadB64).digest('base64url');
  } catch {
    return false;
  }
  const a = Buffer.from(sig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    return typeof payload.exp === 'number' && payload.exp > Date.now();
  } catch {
    return false;
  }
}
