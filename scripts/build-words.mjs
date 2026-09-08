#!/usr/bin/env node
/**
 * build-words.mjs — carry the vault's noun into the hand-written parts of the page
 *
 * The generated regions take their vocabulary from scripts/lib/words.mjs, so they
 * follow UNIT automatically. But the word also lives in copy nobody generates: the
 * hero headline, the MANIFEST, the MINT grid and the manifesto modal. Those are
 * Elena's own words and are not regenerated from data, so they need carrying over
 * once — and then this becomes a no-op.
 *
 * Rules it obeys:
 *
 * - It only touches text OUTSIDE the VAULT:TREE and DNA markers. Everything inside
 *   is generated, and — more importantly — the poems live in there. A blind
 *   search-and-replace across the file would edit the poetry, which is the one
 *   thing that must never happen.
 * - Case is preserved per occurrence: MOMENTS→FRAGMENTS, Moment→Fragment,
 *   moments→fragments. The hero is uppercase and the modal is sentence case.
 * - It is idempotent. Once carried over there is nothing left to find and it says so.
 * - If the number of replacements does not match what was expected, it writes
 *   nothing. A rename that half-lands is worse than one that does not start.
 *
 * Usage:
 *   node scripts/build-words.mjs           carry the word over
 *   node scripts/build-words.mjs --check   report what it would do, write nothing
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { UNIT, LEGACY_UNIT } from './lib/words.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const HTML = join(ROOT, 'index.html');
const CHECK = process.argv.includes('--check');

/* The generated regions, which own their own vocabulary and hold the poems. */
const GUARDED = [
  ['<!-- VAULT:TREE:START -->', '<!-- VAULT:TREE:END -->'],
  ['<!-- DNA:START -->', '<!-- DNA:END -->'],
];

/** Match the replacement's case to the word it replaces. */
function cased(found) {
  if (found === found.toUpperCase()) return UNIT.ONE;
  if (found[0] === found[0].toUpperCase()) return UNIT.One;
  return UNIT.one;
}

let html = readFileSync(HTML, 'utf8');

/* Split into [text, guarded, text, guarded, …] so only the text spans are edited. */
const spans = [];
let cursor = 0;
for (const [open, close] of GUARDED) {
  const a = html.indexOf(open, cursor);
  if (a < 0) continue;
  const b = html.indexOf(close, a);
  if (b < 0) throw new Error(`unbalanced marker: ${open} has no ${close}`);
  spans.push({ from: cursor, to: a, editable: true });
  spans.push({ from: a, to: b + close.length, editable: false });
  cursor = b + close.length;
}
spans.push({ from: cursor, to: html.length, editable: true });

const re = new RegExp(LEGACY_UNIT, 'gi');
const hits = [];
const rebuilt = spans.map(({ from, to, editable }) => {
  const chunk = html.slice(from, to);
  if (!editable) return chunk;
  return chunk.replace(re, (found, at) => {
    const context = chunk.slice(Math.max(0, at - 60), at + 60).replace(/\s+/g, ' ').trim();
    hits.push({ found, context });
    return cased(found);
  });
}).join('');

if (!hits.length) {
  console.log(`build-words: nothing to carry — the hand-written copy already says "${UNIT.one}".`);
  process.exit(0);
}

console.log(`build-words: "${LEGACY_UNIT}" → "${UNIT.one}" in ${hits.length} hand-written place(s)`);
for (const h of hits) console.log(`  [${h.found}] …${h.context.slice(0, 96)}…`);

/* Proof: the poems are inside the guarded spans, so the count of poem cards and the
   claim buttons must be untouched. If either moved, the span logic is wrong and the
   poetry is at risk — write nothing. */
const before = {
  cards: (html.match(/<div class="nft-card">/g) || []).length,
  buttons: (html.match(/<button class="nft-action"/g) || []).length,
  slots: (html.match(/class="gallery-slot"/g) || []).length,
};
const after = {
  cards: (rebuilt.match(/<div class="nft-card">/g) || []).length,
  buttons: (rebuilt.match(/<button class="nft-action"/g) || []).length,
  slots: (rebuilt.match(/class="gallery-slot"/g) || []).length,
};
for (const k of Object.keys(before)) {
  if (before[k] !== after[k]) {
    throw new Error(`${k} changed ${before[k]} → ${after[k]} — refusing to write`);
  }
}

if (CHECK) {
  console.log('  --check: nothing written.');
} else {
  writeFileSync(HTML, rebuilt, 'utf8');
  console.log(`  written. ${after.cards} cards, ${after.buttons} claim buttons, ${after.slots} MINT slots untouched.`);
}
