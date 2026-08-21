// Talks to the Netlify Functions backend. If no backend is reachable (e.g.
// you're running `vite` by itself instead of `netlify dev`), everything
// transparently falls back to an in-browser "demo mode" backed by
// localStorage, using the exact same shared logic (question defaults,
// testimony drafting, panel layout, PDF rendering) as the real server
// functions. That means you can try the whole app — survey, admin, PDF
// download — before ever touching Netlify.
import { getAdminToken } from './adminAuth.js';
import { DEFAULT_QUESTIONS } from '../shared/defaultQuestions.js';
import { DEFAULT_TEMPLATE } from '../shared/defaultTemplate.js';
import { buildDraftTestimony } from '../shared/testimony.js';
import { makeId } from '../shared/id.js';
import { buildPersonalPanels, buildCompiledPanels } from '../shared/panelContent.js';

let demoModeConfirmed = null; // null = unknown, true/false once we've checked

async function checkBackend() {
  if (demoModeConfirmed !== null) return !demoModeConfirmed;
  try {
    const res = await fetch('/.netlify/functions/questions', { method: 'GET' });
    // Plain `vite` (no `netlify dev`) serves index.html for any unmatched
    // GET with a 200 status — so res.ok alone can't tell us a real backend
    // is there. Netlify Functions always answer with JSON (see
    // jsonResponse() in netlify/functions/_auth.js, used even for errors),
    // so require that instead.
    const contentType = res.headers.get('content-type') || '';
    const looksReal = contentType.includes('application/json');
    demoModeConfirmed = !looksReal;
    return looksReal;
  } catch {
    demoModeConfirmed = true;
    return false;
  }
}

export function isDemoMode() {
  return demoModeConfirmed === true;
}

// Call once up front (e.g. on app mount) so isDemoMode() is accurate even
// before any data-fetching call has happened yet.
export async function ensureBackendChecked() {
  await checkBackend();
  return isDemoMode();
}

async function realFetch(path, options = {}) {
  const token = getAdminToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`/.netlify/functions/${path}`, { ...options, headers });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body.error) message = body.error;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  return res;
}

// ---------- demo-mode (localStorage) store ----------
const LS_KEYS = { questions: 'demo_questions', template: 'demo_template', submissions: 'demo_submissions', brochures: 'demo_brochures' };

function lsGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function lsSet(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function lsSubmissions() {
  return lsGet(LS_KEYS.submissions, {});
}
function lsBrochures() {
  return lsGet(LS_KEYS.brochures, {});
}

// ---------- public API ----------

export async function getQuestions() {
  const ok = await checkBackend();
  if (ok) return (await realFetch('questions')).json();
  return lsGet(LS_KEYS.questions, DEFAULT_QUESTIONS);
}

export async function saveQuestions(questions) {
  const ok = await checkBackend();
  if (ok) return (await realFetch('questions', { method: 'PUT', body: JSON.stringify(questions) })).json();
  lsSet(LS_KEYS.questions, questions);
  return questions;
}

export async function getTemplate() {
  const ok = await checkBackend();
  if (ok) return (await realFetch('template')).json();
  return lsGet(LS_KEYS.template, DEFAULT_TEMPLATE);
}

export async function saveTemplate(template) {
  const ok = await checkBackend();
  if (ok) return (await realFetch('template', { method: 'PUT', body: JSON.stringify(template) })).json();
  lsSet(LS_KEYS.template, template);
  return template;
}

export async function createSubmission(payload) {
  const ok = await checkBackend();
  if (ok) return (await realFetch('submissions', { method: 'POST', body: JSON.stringify(payload) })).json();
  const questions = await getQuestions();
  const id = makeId('sub_');
  const submission = {
    id,
    name: (payload.name || '').trim() || 'Anonymous',
    meeting: (payload.meeting || '').trim(),
    ranking: payload.ranking || [],
    customItems: payload.customItems || [],
    answers: payload.answers || {},
    photo: payload.photo || null,
    createdAt: new Date().toISOString(),
    status: 'new',
  };
  submission.testimonyText = buildDraftTestimony(submission, questions);
  const all = lsSubmissions();
  all[id] = submission;
  lsSet(LS_KEYS.submissions, all);
  return submission;
}

export async function getSubmission(id) {
  const ok = await checkBackend();
  if (ok) return (await realFetch(`submissions?id=${encodeURIComponent(id)}`)).json();
  const all = lsSubmissions();
  if (!all[id]) throw new Error('Submission not found.');
  return all[id];
}

export async function listSubmissions() {
  const ok = await checkBackend();
  if (ok) return (await realFetch('submissions')).json();
  const all = lsSubmissions();
  return Object.values(all).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

export async function updateSubmission(id, patch) {
  const ok = await checkBackend();
  if (ok) return (await realFetch(`submissions?id=${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(patch) })).json();
  const all = lsSubmissions();
  if (!all[id]) throw new Error('Submission not found.');
  all[id] = { ...all[id], ...patch, id };
  lsSet(LS_KEYS.submissions, all);
  return all[id];
}

export async function deleteSubmission(id) {
  const ok = await checkBackend();
  if (ok) return (await realFetch(`submissions?id=${encodeURIComponent(id)}`, { method: 'DELETE' })).json();
  const all = lsSubmissions();
  delete all[id];
  lsSet(LS_KEYS.submissions, all);
  return { ok: true };
}

export async function listBrochures() {
  const ok = await checkBackend();
  if (ok) return (await realFetch('brochures')).json();
  const all = lsBrochures();
  return Object.values(all).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

export async function saveBrochure(brochure) {
  const ok = await checkBackend();
  if (ok) {
    if (brochure.id) return (await realFetch(`brochures?id=${encodeURIComponent(brochure.id)}`, { method: 'PUT', body: JSON.stringify(brochure) })).json();
    return (await realFetch('brochures', { method: 'POST', body: JSON.stringify(brochure) })).json();
  }
  const all = lsBrochures();
  const id = brochure.id || makeId('bro_');
  const saved = { ...brochure, id, createdAt: brochure.createdAt || new Date().toISOString(), submissionIds: (brochure.submissionIds || []).slice(0, 3) };
  all[id] = saved;
  lsSet(LS_KEYS.brochures, all);
  return saved;
}

export async function deleteBrochure(id) {
  const ok = await checkBackend();
  if (ok) return (await realFetch(`brochures?id=${encodeURIComponent(id)}`, { method: 'DELETE' })).json();
  const all = lsBrochures();
  delete all[id];
  lsSet(LS_KEYS.brochures, all);
  return { ok: true };
}

// Returns a Blob of the generated PDF, real (server) or demo (client-side
// @react-pdf/renderer), using the same layout code either way.
export async function generatePdfBlob({ mode, submissionId, brochureId }) {
  const ok = await checkBackend();
  if (ok) {
    const token = getAdminToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch('/.netlify/functions/generate-pdf', {
      method: 'POST',
      headers,
      body: JSON.stringify(mode === 'personal' ? { mode, submissionId } : { mode, brochureId }),
    });
    if (!res.ok) {
      let message = 'Could not generate the PDF.';
      try {
        const body = await res.json();
        if (body.error) message = body.error;
      } catch {
        /* ignore */
      }
      throw new Error(message);
    }
    return res.blob();
  }

  // Demo mode: build the same document client-side.
  const { pdf } = await import('@react-pdf/renderer');
  const { buildBrochureDocument } = await import('../shared/brochureDocument.js');
  const questions = await getQuestions();
  const template = await getTemplate();

  let panels;
  if (mode === 'personal') {
    const submission = await getSubmission(submissionId);
    panels = buildPersonalPanels({ submission, questions, template });
  } else {
    const all = lsBrochures();
    const brochure = all[brochureId];
    if (!brochure) throw new Error('Brochure not found.');
    const subsAll = lsSubmissions();
    const submissions = brochure.submissionIds.map((id) => subsAll[id]).filter(Boolean);
    panels = buildCompiledPanels({ brochure, submissions, template });
  }
  const doc = buildBrochureDocument(panels, template);
  return pdf(doc).toBlob();
}

// Searches Unsplash (server-side proxy, so the API key never reaches the
// browser). Returns { configured: false } — not an error — if the site
// admin hasn't set UNSPLASH_ACCESS_KEY yet, or if we're in demo mode
// (there's no server to hold the key at all). Callers should treat that as
// "hide/disable Unsplash search," not as a failure.
export async function searchUnsplash(query) {
  const ok = await checkBackend();
  if (!ok) return { configured: false };
  const res = await fetch(`/.netlify/functions/unsplash-search?q=${encodeURIComponent(query)}`);
  if (!res.ok) {
    let message = 'Unsplash search failed.';
    try {
      const body = await res.json();
      if (body.error) message = body.error;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  return res.json();
}

// Required by Unsplash's API guidelines whenever a photo is actually used
// (not just shown in search results). Best-effort — never blocks the user.
export async function trackUnsplashDownload(downloadLocation) {
  const ok = await checkBackend();
  if (!ok || !downloadLocation) return;
  try {
    await fetch(`/.netlify/functions/unsplash-track?url=${encodeURIComponent(downloadLocation)}`);
  } catch {
    /* best-effort only */
  }
}
