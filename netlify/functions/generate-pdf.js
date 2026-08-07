import { renderToBuffer } from '@react-pdf/renderer';
import { configStore, submissionsStore, brochuresStore } from './_store.js';
import { requireAdmin, jsonResponse, handleError } from './_auth.js';
import { DEFAULT_QUESTIONS } from '../../shared/defaultQuestions.js';
import { DEFAULT_TEMPLATE } from '../../shared/defaultTemplate.js';
import { buildPersonalPanels, buildCompiledPanels } from '../../shared/panelContent.js';
import { buildBrochureDocument } from '../../shared/brochureDocument.js';

// POST /.netlify/functions/generate-pdf
//   { mode: "personal", submissionId }   -> public (the submission id is an
//                                           unlisted capability link, same
//                                           as the GET in submissions.js)
//   { mode: "compiled", brochureId }     -> admin only
export const handler = async (event, context) => {
  if (event.httpMethod !== 'POST') return jsonResponse(405, { error: 'Method not allowed' });

  try {
    const body = JSON.parse(event.body || '{}');
    const template = (await configStore().get('template', { type: 'json' })) || DEFAULT_TEMPLATE;
    const questions = (await configStore().get('questions', { type: 'json' })) || DEFAULT_QUESTIONS;

    let panels;
    let filename;

    if (body.mode === 'personal') {
      if (!body.submissionId) return jsonResponse(400, { error: 'Missing submissionId.' });
      const submission = await submissionsStore().get(body.submissionId, { type: 'json' });
      if (!submission) return jsonResponse(404, { error: 'Submission not found.' });
      panels = buildPersonalPanels({ submission, questions, template });
      filename = `testimony-${(submission.name || 'brochure').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`;
    } else if (body.mode === 'compiled') {
      requireAdmin(context);
      if (!body.brochureId) return jsonResponse(400, { error: 'Missing brochureId.' });
      const brochure = await brochuresStore().get(body.brochureId, { type: 'json' });
      if (!brochure) return jsonResponse(404, { error: 'Brochure not found.' });
      const submissions = (
        await Promise.all(brochure.submissionIds.map((id) => submissionsStore().get(id, { type: 'json' })))
      ).filter(Boolean);
      panels = buildCompiledPanels({ brochure, submissions, template });
      filename = `brochure-${(brochure.title || 'compiled').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`;
    } else {
      return jsonResponse(400, { error: 'mode must be "personal" or "compiled".' });
    }

    const doc = buildBrochureDocument(panels, template);
    const buffer = await renderToBuffer(doc);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
      body: buffer.toString('base64'),
      isBase64Encoded: true,
    };
  } catch (err) {
    return handleError(err);
  }
};
