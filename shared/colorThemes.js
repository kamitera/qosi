// Brand palette. Admins pick one of these themes for the brochure in the
// CMS (a swatch, not a hex code) — the whole PDF (accent text, rules,
// cover tint) derives from it, so nothing can look mismatched.

export const NEUTRALS = {
  ink: '#3B3B3B', // body text
  muted: '#B1B1B1', // secondary text, borders
  paper: '#EEEEEE', // hairlines, subtle fills
};

export const COLOR_THEMES = [
  { id: 'terracotta', name: 'Terracotta', primary: '#B6543C', secondary: '#F4B797', tertiary: '#F8DFD7' },
  { id: 'sage', name: 'Sage', primary: '#5A7668', secondary: '#A9BCAC', tertiary: '#D4DED5' },
  { id: 'gold', name: 'Gold', primary: '#E2B856', secondary: '#EED49A', tertiary: '#F6EACC' },
  { id: 'navy', name: 'Navy', primary: '#05356A', secondary: '#859DB7', tertiary: '#B4C2D2' },
  { id: 'brown', name: 'Warm Brown', primary: '#655247', secondary: '#A88977', tertiary: '#D1C0B7' },
];

export function resolveTheme(themeId) {
  return COLOR_THEMES.find((t) => t.id === themeId) || COLOR_THEMES[1]; // default: sage
}
