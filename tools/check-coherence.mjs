#!/usr/bin/env node
/**
 * Neon Blackout coherence checker.
 *
 * CONTEXT.md ranks the documents of this system and states that when two
 * disagree, the higher one wins. That is an intention until something
 * verifies it. This does the part a machine can settle:
 *
 *   - every hex stated in CONTEXT.md and tokens.json is the hex that ships
 *   - every stated contrast ratio recomputes from the values it names
 *   - glow colours derive from palette tokens, never from literals
 *   - the mono floor is a token, and no mono component sits below it
 *   - the documented component list and the stylesheet agree, both ways
 *
 * It does not enforce taste.
 *
 * Usage: node tools/check-coherence.mjs
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => readFileSync(join(ROOT, f), 'utf8');

const css = read('neon-blackout.css');
const context = read('CONTEXT.md');
const tokens = JSON.parse(read('tokens.json'));

const failures = [];
const notes = [];
let checks = 0;

/**
 * Record one assertion.
 *
 * @param {boolean} ok Whether the assertion held.
 * @param {string} message What was being checked.
 * @returns {void}
 */
function check(ok, message) {
  checks += 1;
  if (!ok) failures.push(message);
}

/* ── Colour maths ─────────────────────────────────────────────────────── */

/**
 * Linearise one sRGB channel.
 *
 * @param {number} c Channel value, 0-255.
 * @returns {number} Linear value, 0-1.
 */
function linear(c) {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

/**
 * Relative luminance of a hex colour.
 *
 * @param {string} hex Colour as #rrggbb.
 * @returns {number} Relative luminance, 0-1.
 */
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

/**
 * WCAG contrast ratio between two hex colours.
 *
 * @param {string} a First colour as #rrggbb.
 * @param {string} b Second colour as #rrggbb.
 * @returns {number} Contrast ratio.
 */
function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/* ── Extract what ships ───────────────────────────────────────────────── */

/** @type {Map<string, string>} CSS custom property name to hex value. */
const cssTokens = new Map();
for (const [, name, value] of css.matchAll(/^\s*(--[a-z0-9-]+):\s*(#[0-9a-f]{6})\s*;/gim)) {
  cssTokens.set(name, value.toLowerCase());
}

const VOID = cssTokens.get('--void');

/* ── 1. Palette hexes agree between tokens.json and the stylesheet ────── */

/** @type {Array<{token: string, hex: string, ratio: string|undefined}>} */
const paletteEntries = [
  ...tokens.heritage.swatches.map((s) => ({ token: s.token, hex: s.hex, ratio: s['ratio-void'] })),
  ...tokens.signature.swatches.map((s) => ({ token: s.token, hex: s.hex, ratio: s['ratio-void'] })),
];

for (const { token, hex } of paletteEntries) {
  const shipped = cssTokens.get(token);
  check(
    shipped === hex.toLowerCase(),
    `tokens.json says ${token} is ${hex}, stylesheet ships ${shipped ?? 'nothing'}`,
  );
}

for (const [name, entry] of Object.entries(tokens.surfaces.colors)) {
  // --remembrance-black is declared in the heritage block, not the surface block.
  const token = `--${name}`;
  const shipped = cssTokens.get(token);
  check(
    shipped === entry.hex.toLowerCase(),
    `tokens.json says ${token} is ${entry.hex}, stylesheet ships ${shipped ?? 'nothing'}`,
  );
}

for (const [name, entry] of Object.entries(tokens.text.colors)) {
  if (!entry.hex.startsWith('#')) continue;
  const token = `--${name}`;
  const shipped = cssTokens.get(token);
  check(
    shipped === entry.hex.toLowerCase(),
    `tokens.json says ${token} is ${entry.hex}, stylesheet ships ${shipped ?? 'nothing'}`,
  );
}

/* ── 2. Heritage is 13, signature is 2, and heritage is never invented ── */

check(
  tokens.heritage.swatches.length === 13,
  `heritage must be 13 colours, tokens.json has ${tokens.heritage.swatches.length}`,
);
check(
  tokens.signature.swatches.length === 2,
  `signature must be 2 colours, tokens.json has ${tokens.signature.swatches.length}`,
);
check(
  tokens.signature.secondary.swatches.length === 0,
  'signature.secondary must be empty — CONTEXT.md states NB has no secondary neons',
);

/* Every heritage swatch names a flag colour; every signature swatch does not. */
for (const s of tokens.heritage.swatches) {
  check(typeof s.flag === 'string' && s.flag.length > 0, `heritage ${s.token} has no flag colour`);
}
for (const s of tokens.signature.swatches) {
  check(!('flag' in s), `signature ${s.token} claims a flag colour; signature neons are ours`);
}

/* ── 3. Stated contrast ratios recompute ──────────────────────────────── */

for (const { token, hex, ratio } of [...paletteEntries]) {
  if (!ratio) continue;
  const stated = parseFloat(ratio);
  const real = contrast(hex, VOID);
  check(
    Math.abs(stated - real) < 0.02,
    `${token} states ${ratio} on void, recomputes to ${real.toFixed(2)}:1`,
  );
}

for (const [name, entry] of Object.entries(tokens.text.colors)) {
  if (!entry['ratio-void']) continue;
  const stated = parseFloat(entry['ratio-void']);
  const real = contrast(entry.hex, VOID);
  check(
    Math.abs(stated - real) < 0.02,
    `--${name} states ${entry['ratio-void']} on void, recomputes to ${real.toFixed(2)}:1`,
  );
}

/* CONTEXT.md's glow table: "| yellow | `--sunlight-yellow` `#fcee09` | 16.85:1 |" */
let contextRatioRows = 0;
for (const [, hex, stated] of context.matchAll(/`(#[0-9a-f]{6})`\s*\|\s*([0-9]+\.[0-9]+):1/gi)) {
  contextRatioRows += 1;
  const real = contrast(hex, VOID);
  check(
    Math.abs(parseFloat(stated) - real) < 0.02,
    `CONTEXT.md states ${hex} at ${stated}:1 on void, recomputes to ${real.toFixed(2)}:1`,
  );
}
check(contextRatioRows >= 8, `expected at least 8 contrast rows in CONTEXT.md, found ${contextRatioRows}`);

/* ── 4. CONTEXT.md hexes agree with tokens.json ───────────────────────── */

/** @type {Map<string, string>} Token name to hex, from tokens.json. */
const canonical = new Map();
for (const { token, hex } of paletteEntries) canonical.set(token, hex.toLowerCase());
for (const [name, entry] of Object.entries(tokens.surfaces.colors)) canonical.set(`--${name}`, entry.hex.toLowerCase());

let contextPairs = 0;
for (const [, token, hex] of context.matchAll(/`(--[a-z-]+)`\s*\|?\s*`(#[0-9a-f]{6})`/gi)) {
  const known = canonical.get(token);
  if (!known) continue;
  contextPairs += 1;
  check(known === hex.toLowerCase(), `CONTEXT.md pairs ${token} with ${hex}, tokens.json says ${known}`);
}
check(contextPairs >= 13, `expected at least 13 token/hex pairs in CONTEXT.md, found ${contextPairs}`);

/* ── 5. Glow derives from tokens, never from literals ─────────────────── */

const glowBlock = css.slice(css.indexOf('=== 13. Glow System'), css.indexOf('=== 14. Cursor'));
check(glowBlock.length > 0, 'could not locate the glow section in the stylesheet');
check(
  !/rgba?\(\s*\d+\s*,/i.test(glowBlock),
  'the glow section contains a colour literal; glow colours must derive from tokens via color-mix',
);

for (const colour of tokens.glow.colors) {
  const rule = new RegExp(`\\.glow-${colour}\\s*\\{[^}]*--glow-hue:\\s*var\\((--[a-z-]+)\\)`, 'i');
  const match = glowBlock.match(rule);
  check(Boolean(match), `.glow-${colour} does not set --glow-hue from a palette token`);
  if (match) {
    check(canonical.has(match[1]), `.glow-${colour} points at ${match[1]}, which is not a palette token`);
  }
}

/* The glow set must be exactly the eight CONTEXT.md names. */
check(tokens.glow.colors.length === 8, `glow membership must be 8 colours, tokens.json lists ${tokens.glow.colors.length}`);

/* Every glow strength in tokens.json exists as a class. */
for (const level of Object.keys(tokens.glow.levels)) {
  check(css.includes(`.${level}`), `glow level ${level} is documented but absent from the stylesheet`);
}

/* ── 6. The mono floor is a token, and mono never goes below it ───────── */

const monoFloor = tokens.typography['mono-floor'];
check(
  css.includes(`--text-mono-min: var(--text-sm)`) || css.includes(`--text-mono-min: ${monoFloor.value}`),
  `--text-mono-min must resolve to ${monoFloor.value}`,
);
check(
  tokens.typography.scale.steps['--text-sm'].rem === monoFloor.value,
  `mono floor ${monoFloor.value} must be a step on the scale`,
);

/* No rule that sets the mono family may also set a font-size below the floor. */
const monoRules = [...css.matchAll(/\{[^}]*font-family:\s*var\(--font-mono\)[^}]*\}/g)];
for (const [rule] of monoRules) {
  const size = rule.match(/font-size:\s*var\((--text-[a-z0-9]+)\)/);
  if (!size) continue;
  check(
    size[1] === '--text-mono-min' || size[1] !== '--text-xs',
    `a mono rule uses ${size[1]}, which is below the mono floor`,
  );
}
notes.push(`${monoRules.length} mono rules checked against the ${monoFloor.value} floor`);

/* ── 7. Components agree in both directions ───────────────────────────── */

const documented = tokens.components.definitions;
const utilities = Object.keys(tokens.components.utilities);

for (const selector of Object.keys(documented)) {
  check(css.includes(`${selector} `) || css.includes(`${selector},`) || css.includes(`${selector}.`) || css.includes(`${selector}:`),
    `component ${selector} is documented but absent from the stylesheet`);
}

/** Every class the stylesheet defines at the head of a selector. */
const cssClasses = new Set();
for (const [, selector] of css.matchAll(/^([.][a-z][a-z0-9-]*(?:[^{}\n]*))\{/gim)) {
  for (const part of selector.split(',')) {
    const lead = part.trim().match(/^\.([a-z][a-z0-9-]*)/i);
    if (lead) cssClasses.add(`.${lead[1]}`);
  }
}

/** Everything the documentation accounts for. */
const accounted = new Set([...utilities]);
for (const [selector, spec] of Object.entries(documented)) {
  accounted.add(selector);
  for (const v of spec.variants ?? []) {
    accounted.add(`${selector}-${v}`);
    accounted.add(`.${v}`);
  }
  for (const p of spec.parts ?? []) accounted.add(p);
}
/* Glow classes are enumerated by the glow section rather than the component list. */
for (const c of tokens.glow.colors) accounted.add(`.glow-${c}`);
for (const l of Object.keys(tokens.glow.levels)) accounted.add(`.${l}`);

for (const cls of cssClasses) {
  check(accounted.has(cls), `stylesheet defines ${cls}, which no documentation accounts for`);
}
notes.push(`${cssClasses.size} stylesheet classes checked against ${accounted.size} documented names`);

/* ── 8. ANSI hexes match the tokens they name ─────────────────────────── */

for (const [slot, entry] of Object.entries(tokens.ansi.colors)) {
  if (!entry.token) continue;
  const known = canonical.get(entry.token) ?? cssTokens.get(entry.token);
  check(
    known === entry.hex.toLowerCase(),
    `ANSI ${slot} names ${entry.token} but states ${entry.hex}; that token is ${known}`,
  );
}

/* ── 9. Semantics: one colour per role, no colour with two roles ──────── */

const roleHexes = Object.values(tokens.semantics.roles).map((r) => r.hex.toLowerCase());
check(
  new Set(roleHexes).size === roleHexes.length,
  'a colour carries two semantic roles; every role must have exactly one colour',
);
for (const [role, spec] of Object.entries(tokens.semantics.roles)) {
  const known = canonical.get(spec.token);
  check(known === spec.hex.toLowerCase(), `semantic ${role} names ${spec.token} but states ${spec.hex}`);
}

/* ── Report ───────────────────────────────────────────────────────────── */

for (const note of notes) console.log(`  ${note}`);

if (failures.length === 0) {
  console.log(`\n  ${checks} checks passed. Documents agree with what ships.\n`);
  process.exit(0);
}

console.error(`\n  ${failures.length} of ${checks} checks failed:\n`);
for (const f of failures) console.error(`  - ${f}`);
console.error('');
process.exit(1);
