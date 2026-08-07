// Standalone sanity check for the brochure PDF layout — renders both a
// personal and a compiled brochure straight to disk, no Netlify/Blobs
// involved. Run with: npm run test:pdf
import { renderToBuffer } from '@react-pdf/renderer';
import { writeFileSync } from 'node:fs';
import { DEFAULT_QUESTIONS } from '../shared/defaultQuestions.js';
import { DEFAULT_TEMPLATE } from '../shared/defaultTemplate.js';
import { buildDraftTestimony } from '../shared/testimony.js';
import { buildPersonalPanels, buildCompiledPanels } from '../shared/panelContent.js';
import { buildBrochureDocument } from '../shared/brochureDocument.js';

const template = DEFAULT_TEMPLATE;
const questions = DEFAULT_QUESTIONS;

const submissionA = {
  id: 'sub_test1',
  name: 'Jordan Rivera',
  meeting: 'Anytown Friends Meeting',
  ranking: ['community', 'peace', 'simplicity', 'integrity', 'equality', 'stewardship'],
  customItems: [],
  answers: {
    why_top: 'I found this meeting after a hard year, and the first thing I noticed was that no one asked me to explain myself before offering me a seat.',
    story: 'Someone brought soup to my door the week my father died, without being asked.',
  },
};
submissionA.testimonyText = buildDraftTestimony(submissionA, questions);

const submissionB = {
  id: 'sub_test2',
  name: 'Sam Okafor',
  meeting: 'Anytown Friends Meeting',
  ranking: ['peace', 'integrity', 'community', 'equality', 'simplicity', 'stewardship'],
  customItems: [],
  answers: { why_top: 'Silence taught me to listen before I speak, in meeting and everywhere else.' },
};
submissionB.testimonyText = buildDraftTestimony(submissionB, questions);

const submissionC = {
  id: 'sub_test3',
  name: 'Priya Chandran',
  meeting: 'Anytown Friends Meeting',
  ranking: ['equality', 'community', 'peace', 'integrity', 'simplicity', 'stewardship'],
  customItems: [],
  answers: { why_top: 'I stayed because everyone’s voice carried the same weight in the room, regardless of title or tenure.' },
};
submissionC.testimonyText = buildDraftTestimony(submissionC, questions);

const personalPanels = buildPersonalPanels({ submission: submissionA, questions, template });
const personalDoc = buildBrochureDocument(personalPanels, template);
const personalBuffer = await renderToBuffer(personalDoc);
writeFileSync('scripts/out-personal.pdf', personalBuffer);
console.log(`personal brochure: ${personalBuffer.length} bytes -> scripts/out-personal.pdf`);

const compiledPanels = buildCompiledPanels({
  brochure: { title: 'Testimonies from Our Meeting' },
  submissions: [submissionA, submissionB, submissionC],
  template,
});
const compiledDoc = buildBrochureDocument(compiledPanels, template);
const compiledBuffer = await renderToBuffer(compiledDoc);
writeFileSync('scripts/out-compiled.pdf', compiledBuffer);
console.log(`compiled brochure: ${compiledBuffer.length} bytes -> scripts/out-compiled.pdf`);
