import { jsonResponse, handleError } from './_auth.js';

// Proxies Unsplash's search API so the access key stays on the server.
// If the site admin hasn't set UNSPLASH_ACCESS_KEY yet, this responds with
// { configured: false } (200, not an error) so the frontend can quietly
// fall back to "upload your own photo" instead of showing a broken search.
//
// GET /.netlify/functions/unsplash-search?q=<query>   (public — same trust
// level as the survey itself; no admin action happens here)
const APP_UTM_SOURCE = 'testimony_brochure_builder';

export const handler = async (event) => {
  if (event.httpMethod !== 'GET') return jsonResponse(405, { error: 'Method not allowed' });
  try {
    const key = process.env.UNSPLASH_ACCESS_KEY;
    if (!key) return jsonResponse(200, { configured: false });

    const query = ((event.queryStringParameters && event.queryStringParameters.q) || '').trim();
    if (!query) return jsonResponse(200, { configured: true, results: [] });

    const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=12`, {
      headers: { Authorization: `Client-ID ${key}` },
    });
    if (!res.ok) {
      return jsonResponse(502, { error: 'Unsplash search failed. Double-check the UNSPLASH_ACCESS_KEY in Netlify.' });
    }
    const data = await res.json();
    const results = (data.results || []).map((p) => ({
      id: p.id,
      thumb: p.urls.thumb,
      full: p.urls.regular,
      photographer: p.user.name,
      photographerUrl: `${p.user.links.html}?utm_source=${APP_UTM_SOURCE}&utm_medium=referral`,
      downloadLocation: p.links.download_location,
    }));
    return jsonResponse(200, { configured: true, results });
  } catch (err) {
    return handleError(err);
  }
};
