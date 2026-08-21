import { brochuresStore } from './_store.js';
import { requireAdmin, jsonResponse, handleError } from './_auth.js';
import { makeId } from '../../shared/id.js';

// Compiled brochures (combining several members' testimonies) are curated
// by admins only — everything here requires sign-in.
//
// GET    /.netlify/functions/brochures            -> list all
// GET    /.netlify/functions/brochures?id=X        -> fetch one
// POST   /.netlify/functions/brochures             -> create { title, submissionIds }
// PUT    /.netlify/functions/brochures?id=X        -> update { title?, submissionIds? }
// DELETE /.netlify/functions/brochures?id=X        -> remove
export const handler = async (event, context) => {
  const store = brochuresStore();
  try {
    requireAdmin(event);

    if (event.httpMethod === 'GET') {
      const id = event.queryStringParameters && event.queryStringParameters.id;
      if (id) {
        const b = await store.get(id, { type: 'json' });
        if (!b) return jsonResponse(404, { error: 'Brochure not found.' });
        return jsonResponse(200, b);
      }
      const { blobs } = await store.list();
      const all = await Promise.all(blobs.map((b) => store.get(b.key, { type: 'json' })));
      all.sort((a, b) => (a && b ? (b.createdAt || '').localeCompare(a.createdAt || '') : 0));
      return jsonResponse(200, all.filter(Boolean));
    }

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const id = makeId('bro_');
      const brochure = {
        id,
        title: body.title || '',
        submissionIds: Array.isArray(body.submissionIds) ? body.submissionIds.slice(0, 3) : [],
        createdAt: new Date().toISOString(),
      };
      await store.setJSON(id, brochure);
      return jsonResponse(201, brochure);
    }

    if (event.httpMethod === 'PUT') {
      const id = event.queryStringParameters && event.queryStringParameters.id;
      if (!id) return jsonResponse(400, { error: 'Missing id.' });
      const existing = await store.get(id, { type: 'json' });
      if (!existing) return jsonResponse(404, { error: 'Brochure not found.' });
      const body = JSON.parse(event.body || '{}');
      const updated = {
        ...existing,
        ...body,
        submissionIds: Array.isArray(body.submissionIds) ? body.submissionIds.slice(0, 3) : existing.submissionIds,
        id,
      };
      await store.setJSON(id, updated);
      return jsonResponse(200, updated);
    }

    if (event.httpMethod === 'DELETE') {
      const id = event.queryStringParameters && event.queryStringParameters.id;
      if (!id) return jsonResponse(400, { error: 'Missing id.' });
      await store.delete(id);
      return jsonResponse(200, { ok: true });
    }

    return jsonResponse(405, { error: 'Method not allowed' });
  } catch (err) {
    return handleError(err);
  }
};
