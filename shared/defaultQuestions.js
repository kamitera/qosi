// The survey definition. Admins edit this through the CMS (Admin > Survey
// Questions) — this file only supplies the starting point for a brand new
// site, and the fallback used in local "demo mode" when no backend is
// connected yet.
//
// Two question types are supported:
//   "ranking" — the respondent taps items in order of importance to them.
//   "text"    — a short free-response answer.

export const DEFAULT_QUESTIONS = {
  introTitle: 'How SPICY Are You?',
  introBody:
    'Quakers often describe our shared values with the acronym SPICE: ' +
    'Simplicity, Peace, Integrity, Community, Equality, and Stewardship. ' +
    'Tap the values below in order, starting with the one that speaks to ' +
    'you most. There are no wrong answers — this is about what draws you ' +
    'to this community.',
  rankingPrompt: 'Tap each value in order, most important first.',
  rankingItems: [
    { id: 'simplicity', label: 'Simplicity', blurb: 'Living without unnecessary clutter, distraction, or excess.' },
    { id: 'peace', label: 'Peace', blurb: 'Seeking nonviolent resolution and the peace that passes understanding.' },
    { id: 'integrity', label: 'Integrity', blurb: 'Letting your life speak — words and actions aligned with truth.' },
    { id: 'community', label: 'Community', blurb: 'Belonging to and caring for a gathered, supportive body.' },
    { id: 'equality', label: 'Equality', blurb: 'Recognizing that of God in everyone, without exception.' },
    { id: 'stewardship', label: 'Stewardship', blurb: 'Caring for the earth and using resources responsibly.' },
  ],
  allowCustomItems: true,
  maxCustomItems: 2,
  followUpQuestions: [
    {
      id: 'why_top',
      label: 'In a sentence or two, why does your top value matter to you?',
      placeholder: 'e.g. Growing up, my family always made room at the table for anyone who needed it...',
      required: true,
    },
    {
      id: 'story',
      label: 'Optional: share a short story or moment that shows this value in your life.',
      placeholder: 'Optional — a sentence is plenty.',
      required: false,
    },
  ],
  respondentFields: [
    { id: 'name', label: 'Your name', required: true },
    { id: 'meeting', label: 'Your meeting / congregation (optional)', required: false },
  ],
};
