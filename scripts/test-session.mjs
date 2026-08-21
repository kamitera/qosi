// Quick sanity check for the admin session token scheme — not part of the
// build, just a one-off verification. Run with: node scripts/test-session.mjs
process.env.ADMIN_SESSION_SECRET = 'test-secret-do-not-use-in-prod';

const { createSessionToken, verifySessionToken } = await import('../netlify/functions/_session.js');

function check(label, condition) {
  console.log(`${condition ? 'PASS' : 'FAIL'} — ${label}`);
  if (!condition) process.exitCode = 1;
}

const token = createSessionToken();
check('a freshly created token verifies as valid', verifySessionToken(token) === true);
check('garbage input is rejected', verifySessionToken('not-a-real-token') === false);
check('empty/undefined is rejected', verifySessionToken(undefined) === false);

// Tamper with the payload half of the token — signature should no longer match.
const [payloadB64, sig] = token.split('.');
const tamperedPayload = Buffer.from(JSON.stringify({ exp: Date.now() + 1000 * 60 * 60 * 24 * 365 * 50 })).toString('base64url');
check('a tampered payload (forged far-future expiry) is rejected', verifySessionToken(`${tamperedPayload}.${sig}`) === false);

// A token signed with a DIFFERENT secret should never verify against this one.
process.env.ADMIN_SESSION_SECRET = 'a-different-secret';
const tokenSignedElsewhere = createSessionToken();
process.env.ADMIN_SESSION_SECRET = 'test-secret-do-not-use-in-prod';
check('a token signed with a different secret is rejected', verifySessionToken(tokenSignedElsewhere) === false);

// An already-expired token should be rejected.
const cryptoMod = await import('node:crypto');
const expiredPayload = Buffer.from(JSON.stringify({ exp: Date.now() - 1000 })).toString('base64url');
const expiredSig = cryptoMod.createHmac('sha256', 'test-secret-do-not-use-in-prod').update(expiredPayload).digest('base64url');
check('an expired token is rejected', verifySessionToken(`${expiredPayload}.${expiredSig}`) === false);

console.log(process.exitCode ? '\nSome checks FAILED.' : '\nAll checks passed.');
