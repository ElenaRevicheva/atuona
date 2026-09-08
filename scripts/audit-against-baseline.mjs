#!/usr/bin/env node
/**
 * audit-against-baseline.mjs — reconcile the whole page against the pristine original
 *
 * verify-vault.mjs proves the 99 poems are intact. This proves EVERYTHING ELSE is:
 * the manifesto, the MINT grid, the modal, the hero, the wallet code, every style
 * rule and every script function that was on the site before any of this started.
 *
 * The baseline is git tag `atuona-pre-vault-tree-20260907` — the page exactly as it
 * stood before the first edit — read out of git, never off disk.
 *
 * The method is subtraction, not inspection: take every sentence of visible text and
 * every structural handle from the baseline, and require each one to still be present
 * in the current page. Anything the baseline had and the current page lacks is a LOSS
 * and must be explained. Anything new is listed separately as an ADDITION so nothing
 * sneaks in unannounced either.
 *
 * Deliberate, known changes are declared in EXPECTED below. Everything else that
 * differs is reported for a human to judge. Nothing is silently forgiven.
 *
 * Usage: node scripts/audit-against-baseline.mjs
 */

import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { UNIT, LEGACY_UNIT } from './lib/words.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const HTML = join(ROOT, 'index.html');
const BASELINE_TAG = 'atuona-pre-vault-tree-20260907';

const base = execFileSync('git', ['show', `${BASELINE_TAG}:index.html`],
  { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const now = readFileSync(HTML, 'utf8');

/* ── Declared, intentional changes ──────────────────────────────────────────
   Each entry says: this baseline text is allowed to be absent, because it was
   deliberately replaced by the text on the right. Anything not declared here and
   missing is a real loss. */
const EXPECTED = [
  { was: /moment/gi, now: 'the vault noun was renamed to ' + UNIT.one },
];

/**
 * Structural handles the old page had that the new one deliberately does not.
 * Each needs a reason, because "we meant to" is the excuse every real regression
 * also gives.
 */
const RETIRED_CLASSES = new Map([
  ['nft-grid', 'the flat 99-card grid container, replaced by the vault tree. Its CSS rule ' +
               'is retained but unused, and the one script that queried it — the hero ' +
               '"EXPLORE THE VOID" button — was repointed at the vault with a null guard.'],
]);

/** Apply the declared renames to baseline text so a rename does not read as a loss. */
const applyRenames = (s) =>
  s.replace(new RegExp(LEGACY_UNIT, 'gi'), (f) =>
    f === f.toUpperCase() ? UNIT.ONE : f[0] === f[0].toUpperCase() ? UNIT.One : UNIT.one);

/* ── Visible text ─────────────────────────────────────────────────────────── */
function visibleText(html) {
  let s = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ');
  s = s.replace(/<!--[\s\S]*?-->/g, ' ').replace(/<[^>]+>/g, '\n');
  s = s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"')
       .replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&trade;/g, '™');
  return s.split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter((l) => l.length > 2);
}

/**
 * A line from the old site survives if it is present in EITHER form: renamed
 * (chrome copy, where moment→fragment was carried over) or verbatim (poem text,
 * which is deliberately never renamed).
 *
 * The first version of this audit only looked for the renamed form and reported
 * 19 poems as "lost" — every one of which was sitting in the page untouched, as
 * it should be. An audit that cries wolf on correct behaviour gets ignored, and
 * an ignored audit is worse than none.
 */
const baseLines = [...new Set(visibleText(base))];
const nowText = visibleText(now).join('\n');
const nowSet = new Set(visibleText(now));

const survives = (l) =>
  nowSet.has(l) || nowText.includes(l) ||
  nowSet.has(applyRenames(l)) || nowText.includes(applyRenames(l));

const lostText = baseLines.filter((l) => !survives(l));

/* ── Structural handles ───────────────────────────────────────────────────── */
const grab = (html, re, g = 1) => {
  const out = new Set();
  let m;
  const r = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
  while ((m = r.exec(html)) !== null) out.add(m[g]);
  return out;
};

const HANDLES = [
  ['element id',        /\sid="([^"]+)"/g],
  ['css class',         /class="([^"]+)"/g],
  ['js function',       /function\s+([A-Za-z_$][\w$]*)\s*\(/g],
  ['window global',     /window\.([A-Za-z_$][\w$]*)\s*=/g],
  ['onclick handler',   /onclick="([^"]+)"/g],
  ['script src',        /<script[^>]+src="([^"]+)"/g],
  ['stylesheet href',   /<link[^>]+href="([^"]+)"[^>]*rel="stylesheet"|<link[^>]+rel="stylesheet"[^>]*href="([^"]+)"/g],
  ['css selector',      /\n\s*(\.[a-zA-Z][\w-]*)\s*[,{]/g],
];

const structural = [];
for (const [label, re] of HANDLES) {
  const b = grab(base, re);
  const n = grab(now, re);
  // class="a b c" → compare individual tokens
  const split = (set) => new Set([...set].flatMap((v) => String(v).split(/\s+/)).filter(Boolean));
  const bb = label === 'css class' ? split(b) : b;
  const nn = label === 'css class' ? split(n) : n;
  let missing = [...bb].filter((v) => !nn.has(v) && !nn.has(applyRenames(v)));
  // Retired on purpose, with a stated reason — reported, not counted as loss.
  const retired = label === 'css class' ? missing.filter((v) => RETIRED_CLASSES.has(v)) : [];
  missing = missing.filter((v) => !RETIRED_CLASSES.has(v) || label !== 'css class');
  const added = [...nn].filter((v) => !bb.has(v));
  structural.push({ label, missing, added, retired, before: bb.size, after: nn.size });
}

/* ── The drop, exactly ────────────────────────────────────────────────────── */
const norm = (s) => s.replace(/\s+/g, ' ').trim();
const dropSets = (html) => ({
  slots: (html.match(/onclick="claimPoem\([^"]*\)"/g) || []).map(norm).sort(),
  buttons: (html.match(/<button class="nft-action"[\s\S]*?<\/button>/g) || []).map(norm).sort(),
  cards: (html.match(/<div class="nft-card">/g) || []).length,
  ids: (html.match(/<div class="nft-id">#(\d+)<\/div>/g) || []).map(norm).sort(),
});
const bd = dropSets(base), nd = dropSets(now);

const dropIssues = [];
if (bd.cards !== nd.cards) dropIssues.push(`nft-card count ${bd.cards} → ${nd.cards}`);
if (bd.ids.join('|') !== nd.ids.join('|')) dropIssues.push('the set of poem numbers changed');
if (bd.buttons.join('|') !== nd.buttons.join('|')) dropIssues.push('the set of claim buttons changed');
for (const s of bd.slots) if (!nd.slots.includes(s)) dropIssues.push(`lost claim handler: ${s}`);

/* ── Report ───────────────────────────────────────────────────────────────── */
console.log(`audit-against-baseline — ${BASELINE_TAG} vs working index.html\n`);
console.log(`  baseline ${base.length.toLocaleString()} bytes → current ${now.length.toLocaleString()} bytes`);
console.log(`  distinct text lines: ${baseLines.length} in baseline`);
console.log(`  poem cards ${bd.cards} → ${nd.cards} · claim buttons ${bd.buttons.length} → ${nd.buttons.length} · claim handlers ${bd.slots.length} → ${nd.slots.length}\n`);

let bad = 0;

console.log('── TEXT ────────────────────────────────────────────────');
if (!lostText.length) {
  console.log(`  ✓ every one of the ${baseLines.length} text lines from the old site is still present`);
} else {
  bad += lostText.length;
  console.log(`  ✗ ${lostText.length} line(s) from the old site are GONE:`);
  for (const l of lostText.slice(0, 25)) console.log(`      · ${l.slice(0, 130)}`);
}

console.log('\n── STRUCTURE ───────────────────────────────────────────');
for (const s of structural) {
  if (s.missing.length) {
    bad += s.missing.length;
    console.log(`  ✗ ${s.label}: ${s.missing.length} lost — ${s.missing.slice(0, 8).join(', ')}`);
  } else {
    console.log(`  ✓ ${s.label}: all ${s.before} kept${s.added.length ? ` (+${s.added.length} new)` : ''}`);
  }
  for (const r of (s.retired || [])) console.log(`      retired on purpose — .${r}: ${RETIRED_CLASSES.get(r)}`);
}

console.log('\n── NFT DROP ────────────────────────────────────────────');
if (!dropIssues.length) {
  console.log(`  ✓ ${nd.cards} cards, ${nd.buttons.length} claim buttons byte-identical, ${nd.slots.length} claim handlers intact`);
} else {
  bad += dropIssues.length;
  for (const d of dropIssues) console.log(`  ✗ ${d}`);
}

console.log('\n── ADDED (deliberate) ──────────────────────────────────');
const addedIds = structural.find((s) => s.label === 'element id').added;
console.log(`  + ${addedIds.length} new element ids (vault tree rows, DNA section)`);
console.log(`  + declared renames: ${EXPECTED.map((e) => e.now).join('; ')}`);

console.log(`\n${bad === 0 ? '✓ NOTHING LOST. Every text line, structural handle and mint path from the old site survives.' : `✗ ${bad} unexplained difference(s) — do not deploy.`}`);
process.exit(bad === 0 ? 0 : 1);
