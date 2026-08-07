import { configStore } from './_store.js';
import { requireAdmin, jsonResponse, handleError } from './_auth.js';
import { DEFAULT_TEMPLATE } from '../../shared/defaultTemplate.js';

// GET  /.netlify/functions/template        -> current brochure template (public, needed to render the PDF)
// PUT  /.netlify/functions/template        -> replace brochure template (admin only)
export const handler = async (event, context) => {
  const store = configStore();
  try {
    if (event.httpMethod === 'GET') {
      const data = await store.get('template', { type: 'json' });
      return jsonResponse(200, data || DEFAULT_TEMPLATE);
    }

    if (event.httpMethod === 'PUT') {
      requireAdmin(context);
      const body = JSON.parse(event.body || '{}');
      await store.setJSON('template', body);
      return jsonResponse(200, body);
    }

    return jsonResponse(405, { error: 'Method not allowed' });
  } catch (err) {
    return handleError(err);
  }
};
