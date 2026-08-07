import { jsonResponse, handleError } from './_auth.js';

// Unsplash's API guidelines require pinging the photo's "download_location"
// URL whenever a photo is actually used (not just shown in search results).
// We proxy that ping server-side too, so the access key never reaches the
// browser. `url` must be an Unsplash API URL — this is a narrow proxy, not
// an open one.
//
// GET /.netlify/functions/unsplash-track?url=<download_location>
export const handler = async (event) => {
  if (event.httpMethod !== 'GET') return jsonResponse(405, { error: 'Method not allowed' });
  try {
    const key = process.env.UNSPLASH_ACCESS_KEY;
    const location = event.queryStringParameters && event.queryStringParameters.url;
    if (!key || !location || !location.startsWith('https://api.unsplash.com/')) {
      return jsonResponse(200, { ok: false });
    }
    await fetch(location, { headers: { Authorization: `Client-ID ${key}` } });
    return jsonResponse(200, { ok: true });
  } catch (err) {
    return handleError(err);
  }
};
