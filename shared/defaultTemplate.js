// The brochure's fixed content — everything that ISN'T a member's personal
// testimony. Admins edit this through the CMS (Admin > Brochure Template).
// Every one of the 6 physical panels has an optional image plus editable
// text; the *dynamic* panels (front cover's name/top-value, the inside
// testimony panel) additionally layer in each member's own answers and
// photo at PDF-generation time — see shared/panelContent.js.

export const DEFAULT_TEMPLATE = {
  orgName: 'Anytown Friends Meeting',
  tagline: 'A place to worship, question, and grow — together.',
  logoDataUrl: '', // set by admin upload; small PNG/JPG, embedded as a data URL
  themeId: 'sage', // see shared/colorThemes.js — admin picks from swatches, not hex codes

  // Panel 1 — Front cover
  frontCoverTitle: 'A Testimony of Faith',
  frontImage: '', // optional accent image, shown above the title

  // Panel 2 — Inside left
  insideLeftHeading: 'What are the Quaker testimonies?',
  insideLeftBody:
    'Friends (Quakers) try to live out a handful of shared values in daily ' +
    'life: Simplicity, Peace, Integrity, Community, Equality, and ' +
    'Stewardship — SPICE, for short. No two Friends live these out the ' +
    'same way. This brochure shares one person’s experience of them.',
  insideLeftImage: '',

  // Panel 3 — Inside center (testimony) — heading/body come from each
  // submission; no admin text fields here, but an optional fallback image
  // is used only when a member didn't add their own photo.
  insideCenterImage: '',

  // Panel 4 — Inside right
  insideRightHeading: 'Join us',
  insideRightBody:
    'We gather every First Day (Sunday) for worship, and welcome newcomers ' +
    'of every background and belief. Come as you are.',
  meetingSchedule: 'Sundays, 10:00 AM — Meeting for Worship\nWednesdays, 7:00 PM — Midweek gathering',
  insideRightImage: '',

  // Panel 5 — Back flap (contact)
  backFlapHeading: 'Visit Us',
  address: '123 Meeting House Rd, Anytown, ST 00000',
  website: 'www.example-meeting.org',
  contactEmail: 'welcome@example-meeting.org',
  contactPhone: '(555) 555-0100',
  backFlapImage: '',

  // Panel 6 — Back cover
  backCoverBlurb: 'Quakers have gathered in worship since 1652. Come sit with us in the silence.',
  backImage: '',

  // Compiled brochures (see Admin > Compile Brochure) reuse the same 6
  // panels; only the front cover's title/intro differ by default.
  compiledTitle: 'Testimonies from Our Meeting',
  compiledIntro:
    'Members of our meeting were asked what draws them to this community. ' +
    'Here, in their own words, are a few of their answers.',
};
