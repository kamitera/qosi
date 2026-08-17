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

// A tiny solid-color PNG, reused as a stand-in "admin panel image" so this
// test can prove the new per-panel image feature renders, with no network
// dependency. (Distinct color per panel would be nicer, but one fixture
// image is enough to confirm placement/sizing doesn't break.)
const TEST_IMG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

const template = {
  ...DEFAULT_TEMPLATE,
  frontImage: TEST_IMG,
  insideLeftImage: TEST_IMG,
  insideRightImage: TEST_IMG,
  backFlapImage: TEST_IMG,
  backImage: TEST_IMG,
};
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
// A tiny 1x1 PNG stands in for an uploaded/Unsplash photo, just to prove
// the photo layout renders without a network dependency in this test.
submissionA.photo = {
  src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  source: 'unsplash',
  photographer: 'Jane Doe',
  photographerUrl: 'https://unsplash.com/@janedoe',
};

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
