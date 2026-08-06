#!/usr/bin/env node
/**
 * Build a single-file, portable copy of preview.html.
 *
 * preview.html links neon-blackout.css and fonts/ so that it is a real
 * consumer of the system: if the stylesheet breaks, the page breaks with it.
 * That property is worth keeping, and it is also why the page renders unstyled
 * when the file travels on its own — over email, into a phone, anywhere its
 * siblings do not follow.
 *
 * This produces a copy with the stylesheet and the faces inlined, for sending
 * and viewing. It is generated, never authored: there is still exactly one
 * stylesheet in this repository, and this file is a photograph of it. Do not
 * edit the output, and do not commit it.
 *
 * Usage: node tools/build-standalone-preview.mjs
 * Output: _build/preview-standalone.html  (gitignored via the _* rule)
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, '_build');
const OUT = join(OUT_DIR, 'preview-standalone.html');

const html = readFileSync(join(ROOT, 'preview.html'), 'utf8');
let css = readFileSync(join(ROOT, 'neon-blackout.css'), 'utf8');

/**
 * Inline every font referenced by the stylesheet as a data URI.
 *
 * @param {string} source The stylesheet text.
 * @returns {{css: string, count: number, bytes: number}} Rewritten CSS and stats.
 */
function inlineFonts(source) {
  let count = 0;
  let bytes = 0;
  const rewritten = source.replace(
    /url\(['"]?(fonts\/[^'")]+\.woff2)['"]?\)/g,
    (_match, path) => {
      const buffer = readFileSync(join(ROOT, path));
      count += 1;
      bytes += buffer.length;
      return `url(data:font/woff2;base64,${buffer.toString('base64')})`;
    },
  );
  return { css: rewritten, count, bytes };
}

const fonts = inlineFonts(css);
css = fonts.css;

if (fonts.count === 0) {
  console.error('  no font references found in the stylesheet — refusing to write a page with no type');
  process.exit(1);
}

/* Replace the stylesheet link with the stylesheet itself. Anything else in the
 * page is already self-contained. */
const LINK = /<link rel="stylesheet" href="neon-blackout\.css">/;
if (!LINK.test(html)) {
  console.error('  preview.html no longer links neon-blackout.css the way this script expects');
  process.exit(1);
}

const note = [
  '<!-- GENERATED FILE — do not edit, do not commit.',
  '     Built from preview.html and neon-blackout.css by',
  '     tools/build-standalone-preview.mjs. Edit those instead. -->',
].join('\n');

const out = html.replace(LINK, `${note}\n<style>\n${css}\n</style>`);

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT, out);

const kb = (n) => `${Math.round(n / 1024)} KB`;
console.log(`  ${fonts.count} faces inlined (${kb(fonts.bytes)})`);
console.log(`  wrote _build/preview-standalone.html (${kb(Buffer.byteLength(out))})`);
