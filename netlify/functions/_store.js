import { getStore } from '@netlify/blobs';

// Netlify Blobs is *supposed* to auto-configure itself inside deployed
// Functions with no setup — but that auto-detection doesn't reliably kick
// in for the classic Lambda-compatible function runtime (a known rough
// edge). When it fails you get MissingBlobsEnvironmentError, and the error
// message itself says the fix: supply siteID + token explicitly.
//
// NETLIFY_BLOBS_SITE_ID and NETLIFY_BLOBS_TOKEN are both env vars the site
// admin adds once (see README) — deliberately not guessed from ambient
// Netlify env vars, since which of those are actually populated at
// function-invocation time (vs. only at build time) isn't reliable enough
// to depend on. If either is missing, we still attempt automatic
// configuration as a fallback — harmless, and it's what makes local
// `netlify dev` keep working without any of this setup.
function storeOptions(name) {
  const siteID = process.env.NETLIFY_BLOBS_SITE_ID;
  const token = process.env.NETLIFY_BLOBS_TOKEN;
  if (siteID && token) return { name, siteID, token };
  return { name };
}

export const configStore = () => getStore(storeOptions('config'));
export const submissionsStore = () => getStore(storeOptions('submissions'));
export const brochuresStore = () => getStore(storeOptions('brochures'));
