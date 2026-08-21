import { configStore } from './_store.js';
import { requireAdmin, jsonResponse, handleError } from './_auth.js';
import { DEFAULT_QUESTIONS } from '../../shared/defaultQuestions.js';

// GET  /.netlify/functions/questions        -> current survey definition (public)
// PUT  /.netlify/functions/questions        -> replace survey definition (admin only)
export const handler = async (event, context) => {
  const store = configStore();
  try {
    if (event.httpMethod === 'GET') {
      const data = await store.get('questions', { type: 'json' });
      return jsonResponse(200, data || DEFAULT_QUESTIONS);
    }

    if (event.httpMethod === 'PUT') {
      requireAdmin(event);
      const body = JSON.parse(event.body || '{}');
      await store.setJSON('questions', body);
      return jsonResponse(200, body);
    }

    return jsonResponse(405, { error: 'Method not allowed' });
  } catch (err) {
    return handleError(err);
  }
};
