// Builds the tri-fold PDF using @react-pdf/renderer.
//
// Written with React.createElement (no JSX) on purpose: Netlify Functions'
// default bundler does not parse JSX in plain .js files, and adding a
// bundler config just for this is one more thing that can break for a
// non-technical maintainer. Plain createElement calls need no extra config.
//
// --- Why the panel order below looks "wrong" ---
// A standard letter tri-fold brochure is ONE sheet of paper, printed on
// both sides, folded in thirds. When you lay the sheet flat, the panels
// are NOT in reading order — printing "front, insideLeft, insideCenter"
// left-to-right would put the cover in the middle of the page. Instead:
//
//   Page 1 (the side that ends up on the OUTSIDE once folded):
//     [ Back Cover | Back Flap | Front Cover ]
//   Page 2 (the side that ends up on the INSIDE once unfolded):
//     [ Inside Left | Inside Center | Inside Right ]
//
// Print page 1, flip the sheet along its long edge, print page 2 on the
// back, then fold the right third in first, the left third over that.

import React from 'react';
import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { NEUTRALS, resolveTheme } from './colorThemes.js';

const PANEL_W = 264; // 792pt (11in landscape) / 3
const PAGE_H = 612; // 8.5in

const styles = StyleSheet.create({
  page: { flexDirection: 'row', backgroundColor: '#ffffff' },
  panel: {
    width: PANEL_W,
    height: PAGE_H,
    padding: 26,
    borderRightWidth: 0.75,
    borderRightColor: NEUTRALS.paper,
    borderRightStyle: 'dashed',
  },
  panelLast: { width: PANEL_W, height: PAGE_H, padding: 26 },
  orgName: { fontSize: 9, textTransform: 'uppercase', letterSpacing: 1.2, color: NEUTRALS.muted },
  title: { fontSize: 21, fontWeight: 700, marginTop: 10, marginBottom: 10, lineHeight: 1.2 },
  topValue: { fontSize: 15, marginBottom: 10 },
  byline: { fontSize: 9, color: NEUTRALS.ink, lineHeight: 1.5 },
  heading: { fontSize: 13, fontWeight: 700, marginBottom: 9 },
  body: { fontSize: 10, lineHeight: 1.55, color: NEUTRALS.ink },
  testimonyBody: { fontSize: 11.5, lineHeight: 1.65, color: NEUTRALS.ink, fontStyle: 'italic' },
  rankRow: { flexDirection: 'row', marginBottom: 5, alignItems: 'center' },
  rankNum: { fontSize: 9, width: 14, color: NEUTRALS.muted },
  rankLabel: { fontSize: 10.5, color: NEUTRALS.ink },
  small: { fontSize: 9.5, lineHeight: 1.7, color: NEUTRALS.ink },
  logo: { width: 42, height: 42, marginBottom: 10, objectFit: 'contain' },
  tagline: { fontSize: 10, fontStyle: 'italic', marginTop: 8, color: NEUTRALS.ink },
  backCoverTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  stampBox: {
    width: 58,
    height: 44,
    flexShrink: 0,
    borderWidth: 0.75,
    borderColor: NEUTRALS.muted,
    borderStyle: 'solid',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stampBoxText: { fontSize: 6.5, color: NEUTRALS.muted, textAlign: 'center' },
  contactLine: { fontSize: 10, marginBottom: 6, lineHeight: 1.4, color: NEUTRALS.ink },
  ruleThin: { width: 30, height: 2.5, marginBottom: 10 },
  photo: { width: '100%', height: 120, objectFit: 'cover', borderRadius: 3, marginBottom: 8 },
  photoCredit: { fontSize: 6.5, color: NEUTRALS.muted, marginBottom: 10 },
});

const E = React.createElement;

function accentStyle(theme, base) {
  return { ...base, color: theme.primary };
}

function tintPanelStyle(base, theme) {
  return { ...base, backgroundColor: theme.tertiary };
}

function Logo(template) {
  if (!template.logoDataUrl) return null;
  return E(Image, { src: template.logoDataUrl, style: styles.logo });
}

function Rule(theme) {
  return E(View, { style: { ...styles.ruleThin, backgroundColor: theme.primary } });
}

// The admin's per-panel accent image (distinct from a member's own
// testimony photo, though rendered the same visual way).
function PanelImage(data) {
  if (!data.image) return null;
  return E(Image, { src: data.image, style: styles.photo });
}

function FrontCoverPanel({ data, template, theme, last }) {
  return E(
    View,
    { style: tintPanelStyle(last ? styles.panelLast : styles.panel, theme) },
    Logo(template),
    E(Text, { style: styles.orgName }, data.orgName),
    Rule(theme),
    PanelImage(data),
    E(Text, { style: accentStyle(theme, styles.title) }, data.title),
    data.topValue ? E(Text, { style: accentStyle(theme, styles.topValue) }, data.topValue) : null,
    E(Text, { style: styles.byline }, data.byline)
  );
}

function TextPanel({ data, template, theme, last }) {
  return E(
    View,
    { style: last ? styles.panelLast : styles.panel },
    PanelImage(data),
    data.heading ? E(Text, { style: accentStyle(theme, styles.heading) }, data.heading) : null,
    data.body ? E(Text, { style: styles.body }, data.body) : null,
    Array.isArray(data.ranking) && data.ranking.length
      ? E(
          View,
          { style: { marginTop: 12 } },
          data.ranking.map((label, i) =>
            E(
              View,
              { key: label + i, style: styles.rankRow },
              E(Text, { style: { ...styles.rankNum, color: theme.primary } }, `${i + 1}.`),
              E(Text, { style: styles.rankLabel }, label)
            )
          )
        )
      : null,
    data.schedule
      ? E(
          View,
          { style: { marginTop: 12 } },
          String(data.schedule)
            .split('\n')
            .filter(Boolean)
            .map((line, i) => E(Text, { key: i, style: styles.small }, line))
        )
      : null
  );
}

function TestimonyPanel({ data, template, theme, last }) {
  return E(
    View,
    { style: last ? styles.panelLast : styles.panel },
    data.photo && data.photo.src ? E(Image, { src: data.photo.src, style: styles.photo }) : null,
    data.photo && data.photo.source === 'unsplash' && data.photo.photographer
      ? E(Text, { style: styles.photoCredit }, `Photo: ${data.photo.photographer} / Unsplash`)
      : null,
    data.heading ? E(Text, { style: accentStyle(theme, styles.heading) }, data.heading) : null,
    data.body ? E(Text, { style: styles.testimonyBody }, `“${data.body}”`) : null
  );
}

function ContactPanel({ data, template, theme, last }) {
  return E(
    View,
    { style: tintPanelStyle(last ? styles.panelLast : styles.panel, theme) },
    PanelImage(data),
    E(Text, { style: accentStyle(theme, styles.heading) }, data.heading || 'Visit Us'),
    data.address ? E(Text, { style: styles.contactLine }, data.address) : null,
    data.website ? E(Text, { style: styles.contactLine }, data.website) : null,
    data.email ? E(Text, { style: styles.contactLine }, data.email) : null,
    data.phone ? E(Text, { style: styles.contactLine }, data.phone) : null
  );
}

function BackCoverPanel({ data, template, theme, last }) {
  return E(
    View,
    { style: tintPanelStyle(last ? styles.panelLast : styles.panel, theme) },
    // Logo/org name and the mailing "place stamp here" box share a row so
    // the box can't collide with whatever content flows below it (e.g. an
    // admin-added panel image) — it used to be absolutely positioned,
    // which broke as soon as this panel could contain more than a couple
    // of short lines of text.
    E(
      View,
      { style: styles.backCoverTopRow },
      E(View, {}, Logo(template), E(Text, { style: styles.orgName }, data.orgName)),
      E(View, { style: styles.stampBox }, E(Text, { style: styles.stampBoxText }, 'place\nstamp\nhere'))
    ),
    PanelImage(data),
    data.blurb ? E(Text, { style: { ...styles.body, marginTop: 8 } }, data.blurb) : null,
    data.tagline ? E(Text, { style: accentStyle(theme, styles.tagline) }, data.tagline) : null
  );
}

function panelFor(kind, data, template, theme, last) {
  const Comp = { front: FrontCoverPanel, text: TextPanel, testimony: TestimonyPanel, contact: ContactPanel, back: BackCoverPanel }[kind] || TextPanel;
  return E(Comp, { data, template, theme, last });
}

export function buildBrochureDocument(panels, template) {
  const theme = resolveTheme(template.themeId);
  return E(
    Document,
    { title: panels.front.title || 'Brochure' },
    // Page 1 — outside of the folded brochure
    E(
      Page,
      { size: 'LETTER', orientation: 'landscape', style: styles.page },
      panelFor(panels.back.kind, panels.back, template, theme, false),
      panelFor(panels.backFlap.kind, panels.backFlap, template, theme, false),
      panelFor(panels.front.kind, panels.front, template, theme, true)
    ),
    // Page 2 — inside of the folded brochure
    E(
      Page,
      { size: 'LETTER', orientation: 'landscape', style: styles.page },
      panelFor(panels.insideLeft.kind, panels.insideLeft, template, theme, false),
      panelFor(panels.insideCenter.kind, panels.insideCenter, template, theme, false),
      panelFor(panels.insideRight.kind, panels.insideRight, template, theme, true)
    )
  );
}
