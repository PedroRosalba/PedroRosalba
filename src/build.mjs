// Renders every SVG in assets/ from src/profile.mjs.
// Each piece has a desktop layout (900 wide, ~1:1 in GitHub's profile column) and a
// mobile layout (420 wide), swapped by <picture media="(max-width: …)"> in README.md.
// Text is converted to Geist / Geist Mono outlines: GitHub serves README SVGs with
// `default-src 'none'`, so embedded fonts would be blocked.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import opentype from 'opentype.js';
import { whoami, now } from './profile.mjs';

const OUT = new URL('../assets/', import.meta.url);
mkdirSync(OUT, { recursive: true });

// ── palette (the website's tokens) ───────────────────────────────────────────
const C = {
  bg: '#050507',
  ink: '#edebe6',
  ink2: '#b9b7be',
  ink3: '#a3a1a9',
  dim: '#8f8d95',
  mute: '#6a6a73',
  faint: '#3a3a43',
  line: '#24242b',
  accent: '#7b61ff',
  halo: '#d6cdff',
};

// ── type ─────────────────────────────────────────────────────────────────────
const font = (file) => {
  const buf = readFileSync(new URL(`../node_modules/geist/dist/fonts/${file}`, import.meta.url));
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
};
const F = {
  light: font('geist-sans/Geist-Light.ttf'),
  regular: font('geist-sans/Geist-Regular.ttf'),
  mono: font('geist-mono/GeistMono-Regular.ttf'),
};

function layout(f, str, size, tracking = 0) {
  const glyphs = f.stringToGlyphs(str);
  const k = size / f.unitsPerEm;
  const xs = [];
  let x = 0;
  glyphs.forEach((g, i) => {
    if (g.index === 0) throw new Error(`missing glyph for "${str[i]}" in "${str}"`);
    xs.push(x);
    x += g.advanceWidth * k + tracking * size;
    if (glyphs[i + 1]) x += f.getKerningValue(g, glyphs[i + 1]) * k;
  });
  return { glyphs, xs, width: x - tracking * size };
}

const measure = (str, { font: f = F.regular, size, tracking = 0 }) => layout(f, str, size, tracking).width;

function text(str, { font: f = F.regular, size, x, y, tracking = 0, anchor = 'start', fill = C.ink, attrs = '' }) {
  const { glyphs, xs, width } = layout(f, str, size, tracking);
  const x0 = anchor === 'end' ? x - width : anchor === 'middle' ? x - width / 2 : x;
  const d = glyphs.map((g, i) => g.getPath(x0 + xs[i], y, size).toPathData(1)).join('');
  return `<path fill="${fill}" ${attrs} d="${d}"/>`;
}

function wrap(str, opts, max) {
  const lines = [''];
  for (const word of str.split(' ')) {
    const next = lines.at(-1) ? `${lines.at(-1)} ${word}` : word;
    if (measure(next, opts) > max && lines.at(-1)) lines.push(word);
    else lines[lines.length - 1] = next;
  }
  return lines;
}

// Type roles, shared by every asset.
const T = {
  eyebrow: { font: F.mono, size: 10.5, tracking: 0.26, fill: C.ink3 },
  meta: { font: F.mono, size: 9, tracking: 0.18, fill: C.dim },
};

// ── helpers ──────────────────────────────────────────────────────────────────
function rng(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const r1 = (n) => Math.round(n * 10) / 10;
const mix = (a, b, t) => {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [A, B] = [p(a), p(b)];
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
};
const REDUCED = '@media (prefers-reduced-motion: reduce){*{animation:none!important}}';
const svg = (w, h, title, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${title}"><title>${title}</title>${body}</svg>\n`;

function save(name, content) {
  writeFileSync(new URL(name, OUT), content);
  console.log(`${name.padEnd(24)} ${(content.length / 1024).toFixed(1)} kB`);
}

// ── the eclipse: corona drawn as a radial spectrum ──────────────────────────
// Streamers are gaussian lobes around the disc (wide at the equator, thin plumes
// at the pole) with per-tick grain. Each tick breathes on a slow, phase-shifted
// cycle over a static blurred copy, so the corona shimmers like light, not an EQ.
function eclipse({ cx, cy, R, horizon, W, N = 300, reach = 40, id = 'e' }) {
  const rand = rng(11);
  const lobes = [
    [-1.45, 0.34, 0.95], [1.5, 0.3, 0.85], [-0.78, 0.17, 0.5], [0.82, 0.2, 0.45],
    [-0.22, 0.06, 0.32], [0.04, 0.05, 0.38], [0.3, 0.06, 0.28], [-2.3, 0.24, 0.7], [2.35, 0.22, 0.6],
  ];
  const lines = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 - Math.PI; // 0 = straight up
    let env = 0.05;
    for (const [c, w, h] of lobes) {
      const d = Math.atan2(Math.sin(a - c), Math.cos(a - c));
      env += h * Math.exp(-(d * d) / (2 * w * w));
    }
    const amp = Math.min(1, env) * (0.5 + 0.5 * rand());
    lines.push({
      deg: r1((a * 180) / Math.PI),
      len: r1(2 + reach * amp),
      col: mix(C.ink, C.halo, Math.min(1, amp * 1.3)),
      op: Math.round((0.14 + 0.7 * amp) * 100) / 100,
      dur: [5.2, 6.4, 7.9][i % 3],
      delay: r1(-((i / N) * 12) - rand()),
    });
  }
  const seg = (l) => `x1="${cx}" y1="${cy - R - 3}" x2="${cx}" y2="${r1(cy - R - 3 - l.len)}" stroke="${l.col}" stroke-opacity="${l.op}"`;
  // Animated ticks need a wrapper: a CSS transform would replace the rotate attribute.
  const tick = (l, anim) =>
    anim
      ? `<g transform="rotate(${l.deg} ${cx} ${cy})"><line class="t" style="animation:br ${l.dur}s ${l.delay}s ease-in-out infinite" ${seg(l)}/></g>`
      : `<line transform="rotate(${l.deg} ${cx} ${cy})" ${seg(l)}/>`;
  const stars = [];
  for (let i = 0; i < 34; i++) {
    const x = r1(rand() * W), y = r1(10 + rand() * (horizon - 30));
    if (Math.hypot(x - cx, y - cy) < R + 56) continue;
    const tw = i % 4 === 0 ? ` class="tw" style="animation-delay:${r1(-rand() * 8)}s"` : '';
    stars.push(`<circle cx="${x}" cy="${y}" r="${r1(0.3 + rand() * 0.6)}" fill="${C.ink}" opacity="${r1(0.1 + rand() * 0.3)}"${tw}/>`);
  }
  const css = `.t{transform-box:fill-box;transform-origin:50% 100%}
    @keyframes br{0%,100%{transform:scaleY(1)}50%{transform:scaleY(.4)}}
    .tw{animation:tw 8s ease-in-out infinite}@keyframes tw{0%,100%{opacity:.08}50%{opacity:.55}}`;
  const defs = `
    <radialGradient id="${id}h" cx="${cx}" cy="${cy}" r="${r1(R * 2.5)}" gradientUnits="userSpaceOnUse">
      <stop offset=".4" stop-color="${C.accent}" stop-opacity=".24"/>
      <stop offset=".62" stop-color="${C.accent}" stop-opacity=".05"/>
      <stop offset="1" stop-color="${C.accent}" stop-opacity="0"/>
    </radialGradient>
    <filter id="${id}b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${r1(R / 22)}"/></filter>
    <filter id="${id}g" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.4"/></filter>
    <clipPath id="${id}s"><rect width="${W}" height="${horizon}"/></clipPath>`;
  const body = `${stars.join('')}
  <g clip-path="url(#${id}s)">
    <circle cx="${cx}" cy="${cy}" r="${r1(R * 2.5)}" fill="url(#${id}h)"/>
    <circle cx="${cx}" cy="${cy}" r="${R + 1}" fill="none" stroke="${C.accent}" stroke-width="${r1(R / 12)}" opacity=".5" filter="url(#${id}b)"/>
    <g filter="url(#${id}g)" stroke-width="2.2" opacity=".55">${lines.map((l) => tick(l, false)).join('')}</g>
    <g stroke-width=".8" stroke-linecap="round">${lines.map((l) => tick(l, true)).join('')}</g>
    <circle cx="${cx}" cy="${cy}" r="${R}" fill="#000"/>
    <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${C.halo}" stroke-width="1.2" stroke-opacity=".9"/>
  </g>`;
  return { css, defs, body };
}

// ── columns ──────────────────────────────────────────────────────────────────
// The README is one scene drawn as two 420-wide columns, placed edge to edge at
// width="419": identity over `whoami` on the left, the eclipse over `cat ~/.now`
// on the right. On desktop they meet without a gap; on a phone they stack, and
// each column still reads on its own. Images can't be split on GitHub without a
// visible seam, so each column is one image from sky to terminal.
const TW = 420, TL = 28;
const BLURB = { size: 14 };
const LH = 21;
const MONO = { font: F.mono, size: 12 };
const ROW = 22;

const HERO_H = 344, HORIZON = 300;
const FLOOR = 300; // how far below the horizon the fog fades out
const ECL = { cx: 210, cy: 210, R: 104 };

function rowsHeight(rows) {
  return 44 + 38 + (rows.length - 1) * ROW + 46 + 34;
}
const PANE_H = Math.max(rowsHeight(whoami), rowsHeight(now));
const H = HERO_H + PANE_H;

// Fog below the horizon, and the eclipse's light pooling on the floor beneath it.
const floor = `<linearGradient id="fl" x1="0" y1="${HORIZON}" x2="0" y2="${HORIZON + FLOOR}" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#262238" stop-opacity=".75"/><stop offset=".22" stop-color="#16141f" stop-opacity=".6"/><stop offset="1" stop-color="#0b0a10" stop-opacity="0"/></linearGradient>`;
const pool = (cx) => `<radialGradient id="pl" cx="${cx}" cy="${HORIZON}" r="${ECL.R * 2.1}" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="${C.accent}" stop-opacity=".2"/><stop offset=".55" stop-color="${C.accent}" stop-opacity=".05"/><stop offset="1" stop-color="${C.accent}" stop-opacity="0"/></radialGradient>`;
const ground = () => `
  <rect y="${HORIZON}" width="${TW}" height="${H - HORIZON}" fill="url(#fl)"/>
  <rect y="${HORIZON}" width="${TW}" height="${ECL.R * 2.2}" fill="url(#pl)"/>
  <line x1="0" y1="${HORIZON + 0.5}" x2="${TW}" y2="${HORIZON + 0.5}" stroke="${C.halo}" stroke-opacity=".08"/>`;

function prompt(cmd, y, cursor = false) {
  const host = 'pedro@rosalba';
  const hw = measure(host, MONO);
  const sw = measure(':~$ ', MONO);
  const cw = measure(cmd, MONO);
  const block = cursor
    ? `<rect class="cur" x="${r1(TL + hw + sw + cw + (cmd ? 4 : 0))}" y="${y - 10}" width="7" height="13" fill="${C.ink}"/>`
    : '';
  return `${text(host, { ...MONO, x: TL, y, fill: C.halo })}${text(':~$', { ...MONO, x: TL + hw, y, fill: C.mute })}${cmd ? text(cmd, { ...MONO, x: TL + hw + sw, y }) : ''}${block}`;
}

// A terminal pane: keys, dot leaders, right-aligned values, set in Geist Mono.
function pane(cmd, rows, active) {
  const y0 = HERO_H + 44;
  const dot = measure('.', MONO);
  const lines = rows
    .map(([k, v], i) => {
      const y = y0 + 38 + i * ROW;
      const vw = measure(v, MONO);
      if (!k) return text(v, { ...MONO, x: TW - TL, y, anchor: 'end', fill: C.ink2 });
      const kw = measure(k, MONO);
      const n = Math.max(2, Math.floor((TW - TL * 2 - kw - vw - 16) / dot));
      return text(k, { ...MONO, x: TL, y, fill: C.ink3 })
        + text('.'.repeat(n), { ...MONO, x: TL + kw + 8, y, fill: C.faint })
        + text(v, { ...MONO, x: TW - TL, y, anchor: 'end' });
    })
    .join('');
  return `${prompt(cmd, y0)}${lines}${prompt('', H - 34, active)}`;
}

const CURSOR = `.cur{animation:blink 1.1s steps(1) infinite}@keyframes blink{50%{opacity:0}}`;

function left() {
  const rand = rng(5);
  const stars = Array.from({ length: 14 }, () =>
    `<circle cx="${r1(rand() * TW)}" cy="${r1(12 + rand() * 120)}" r="${r1(0.3 + rand() * 0.5)}" fill="${C.ink}" opacity="${r1(0.08 + rand() * 0.22)}"/>`).join('');
  const hx = TW + ECL.cx; // the eclipse sits in the next column; its halo spills here
  const sentence = wrap('Drawn to low-level systems and core infrastructure — runtimes, cryptography, distributed and decentralized systems. The engines that move software.', BLURB, TW - TL * 2);
  const body = `
  <defs>${floor}${pool(hx)}
    <radialGradient id="spill" cx="${hx}" cy="${ECL.cy}" r="${ECL.R * 2.5}" gradientUnits="userSpaceOnUse">
      <stop offset=".4" stop-color="${C.accent}" stop-opacity=".24"/><stop offset=".62" stop-color="${C.accent}" stop-opacity=".05"/><stop offset="1" stop-color="${C.accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${TW}" height="${H}" fill="${C.bg}"/>
  ${stars}
  <rect width="${TW}" height="${HORIZON}" fill="url(#spill)"/>
  ${ground()}
  ${text('SOFTWARE · AI · SYSTEMS', { ...T.eyebrow, x: TL, y: 68 })}
  ${text('Pedro', { font: F.light, size: 60, x: TL - 3, y: 138, tracking: -0.02 })}
  ${text('Rosalba', { font: F.light, size: 60, x: TL - 3, y: 198, tracking: -0.02 })}
  ${sentence.map((l, i) => text(l, { ...BLURB, x: TL, y: 240 + i * LH, fill: C.ink2 })).join('')}
  ${pane('whoami', whoami, false)}`;
  save('left.svg', svg(TW, H, 'Pedro Rosalba — Software · AI · Systems', body));
}

function right() {
  const e = eclipse({ ...ECL, horizon: HORIZON, W: TW, N: 280, reach: 40 });
  const body = `
  <defs><style>${e.css}${CURSOR}${REDUCED}</style>${e.defs}${floor}${pool(ECL.cx)}</defs>
  <rect width="${TW}" height="${H}" fill="${C.bg}"/>
  ${e.body}
  ${ground()}
  ${pane('cat ~/.now', now, true)}`;
  save('right.svg', svg(TW, H, 'An eclipse over a dark horizon, and what Pedro is building now', body));
}

left();
right();
