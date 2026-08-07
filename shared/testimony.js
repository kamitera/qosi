// Turns a survey submission into a first-draft testimony paragraph.
// This is deliberately simple templating (no AI call, no external
// dependency) — admins can always edit the resulting text by hand in the
// CMS before it's printed.

export function buildDraftTestimony(submission, questions) {
  const items = [...(questions.rankingItems || []), ...(submission.customItems || []).map((c) => ({ id: c.id, label: c.label }))];
  const rankedIds = submission.ranking || [];
  const topId = rankedIds[0];
  const top = items.find((i) => i.id === topId);
  const topLabel = top ? top.label : 'this value';

  const why = (submission.answers && submission.answers.why_top) || '';
  const story = (submission.answers && submission.answers.story) || '';

  let text = `${topLabel} speaks to me more than any other value.`;
  if (why) text += ` ${why}`;
  if (story) text += ` ${story}`;
  return text.trim();
}

// Human-readable ranked list, e.g. "Peace, Community, Simplicity"
export function rankedLabels(submission, questions) {
  const items = [...(questions.rankingItems || []), ...(submission.customItems || []).map((c) => ({ id: c.id, label: c.label }))];
  const byId = Object.fromEntries(items.map((i) => [i.id, i.label]));
  return (submission.ranking || []).map((id) => byId[id]).filter(Boolean);
}
