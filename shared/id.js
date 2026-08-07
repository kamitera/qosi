// Small dependency-free id generator (works in both the browser and
// Netlify's Node function runtime without needing the `crypto` module's
// randomUUID everywhere, which is fine on Node 18+, but this keeps it
// trivially portable).
export function makeId(prefix = '') {
  const rand = Math.random().toString(36).slice(2, 10);
  const time = Date.now().toString(36);
  return `${prefix}${time}${rand}`;
}
