import { rankedLabels } from './testimony.js';

// Builds the 6 logical brochure panels (in *reading* order) for a single
// member's personal testimony brochure. The PDF layout is responsible for
// re-arranging these into print order (see pdf/document.js).
//
// Every panel carries an `image` — the admin's per-panel template image —
// except insideCenter, which prefers the member's own uploaded/Unsplash
// photo and only falls back to the admin's image if they didn't add one.
export function buildPersonalPanels({ submission, questions, template }) {
  const ranking = rankedLabels(submission, questions);

  return {
    front: {
      kind: 'front',
      orgName: template.orgName,
      title: template.frontCoverTitle,
      topValue: ranking[0] || '',
      byline: [submission.name, submission.meeting].filter(Boolean).join('  ·  '),
      image: template.frontImage || null,
    },
    insideLeft: {
      kind: 'text',
      heading: template.insideLeftHeading,
      body: template.insideLeftBody,
      ranking,
      image: template.insideLeftImage || null,
    },
    insideCenter: {
      kind: 'testimony',
      heading: submission.name ? `In ${possessive(submission.name)} own words` : 'In their own words',
      body: submission.testimonyText || '',
      photo: submission.photo || (template.insideCenterImage ? { src: template.insideCenterImage, source: 'template' } : null),
    },
    insideRight: {
      kind: 'text',
      heading: template.insideRightHeading,
      body: template.insideRightBody,
      schedule: template.meetingSchedule,
      image: template.insideRightImage || null,
    },
    backFlap: {
      kind: 'contact',
      heading: template.backFlapHeading,
      address: template.address,
      website: template.website,
      email: template.contactEmail,
      phone: template.contactPhone,
      image: template.backFlapImage || null,
    },
    back: {
      kind: 'back',
      orgName: template.orgName,
      tagline: template.tagline,
      blurb: template.backCoverBlurb,
      image: template.backImage || null,
    },
  };
}

// Builds panels for a compiled brochure combining up to 3 members'
// testimonies (one per inside panel).
export function buildCompiledPanels({ brochure, submissions, template }) {
  const picks = submissions.slice(0, 3);
  const slots = ['insideLeft', 'insideCenter', 'insideRight'];
  const panels = {
    front: {
      kind: 'front',
      orgName: template.orgName,
      title: brochure.title || template.compiledTitle,
      topValue: '',
      byline: template.compiledIntro,
      image: template.frontImage || null,
    },
    backFlap: {
      kind: 'contact',
      heading: template.backFlapHeading,
      address: template.address,
      website: template.website,
      email: template.contactEmail,
      phone: template.contactPhone,
      image: template.backFlapImage || null,
    },
    back: {
      kind: 'back',
      orgName: template.orgName,
      tagline: template.tagline,
      blurb: template.backCoverBlurb,
      image: template.backImage || null,
    },
  };
  slots.forEach((slot, i) => {
    const s = picks[i];
    panels[slot] = s
      ? { kind: 'testimony', heading: [s.name, s.meeting].filter(Boolean).join(', '), body: s.testimonyText || '', photo: s.photo || null }
      : { kind: 'text', heading: '', body: '' };
  });
  return panels;
}

function possessive(name) {
  return /s$/i.test(name) ? `${name}'` : `${name}'s`;
}
