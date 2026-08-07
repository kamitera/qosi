import { configStore, submissionsStore } from './_store.js';
import { requireAdmin, jsonResponse, handleError } from './_auth.js';
import { DEFAULT_QUESTIONS } from '../../shared/defaultQuestions.js';
import { buildDraftTestimony } from '../../shared/testimony.js';
import { makeId } from '../../shared/id.js';

// GET    /.netlify/functions/submissions           -> list all (admin only)
// GET    /.netlify/functions/submissions?id=X       -> fetch one (public — the id itself
//                                                       is the unlisted capability link a
//                                                       respondent gets after submitting)
// POST   /.netlify/functions/submissions            -> create one (public, the survey itself)
// PUT    /.netlify/functions/submissions?id=X       -> update one, e.g. edit testimony text (admin only)
// DELETE /.netlify/functions/submissions?id=X       -> remove one (admin only)
export const handler = async (event, context) => {
  const store = submissionsStore();
  try {
    if (event.httpMethod === 'GET') {
      const id = event.queryStringParameters && event.queryStringParameters.id;
      if (id) {
        const sub = await store.get(id, { type: 'json' });
        if (!sub) return jsonResponse(404, { error: 'Submission not found.' });
        return jsonResponse(200, sub);
      }
      requireAdmin(context);
      const { blobs } = await store.list();
      const all = await Promise.all(blobs.map((b) => store.get(b.key, { type: 'json' })));
      all.sort((a, b) => (b && a ? (b.createdAt || '').localeCompare(a.createdAt || '') : 0));
      return jsonResponse(200, all.filter(Boolean));
    }

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const questions = (await configStore().get('questions', { type: 'json' })) || DEFAULT_QUESTIONS;

      const id = makeId('sub_');
      const submission = {
        id,
        name: (body.name || '').trim() || 'Anonymous',
        meeting: (body.meeting || '').trim(),
        ranking: Array.isArray(body.ranking) ? body.ranking : [],
        customItems: Array.isArray(body.customItems) ? body.customItems : [],
        answers: body.answers && typeof body.answers === 'object' ? body.answers : {},
        photo: body.photo && typeof body.photo === 'object' ? body.photo : null,
        createdAt: new Date().toISOString(),
        status: 'new',
      };
      submission.testimonyText = buildDraftTestimony(submission, questions);

      await store.setJSON(id, submission);
      return jsonResponse(201, submission);
    }

    if (event.httpMethod === 'PUT') {
      requireAdmin(context);
      const id = event.queryStringParameters && event.queryStringParameters.id;
      if (!id) return jsonResponse(400, { error: 'Missing id.' });
      const existing = await store.get(id, { type: 'json' });
      if (!existing) return jsonResponse(404, { error: 'Submission not found.' });
      const body = JSON.parse(event.body || '{}');
      const updated = { ...existing, ...body, id };
      await store.setJSON(id, updated);
      return jsonResponse(200, updated);
    }

    if (event.httpMethod === 'DELETE') {
      requireAdmin(context);
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
