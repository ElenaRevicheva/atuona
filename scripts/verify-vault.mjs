#!/usr/bin/env node
/**
 * verify-vault.mjs — prove the book still holds every poem, and still mints.
 *
 * ── Why a lock file ─────────────────────────────────────────────────────────
 * The build already checks itself, but a build checking its own output against
 * its own input can only prove it was internally consistent. It cannot prove the
 * INPUT was right. content/poems.json was derived by a script I wrote; if that
 * script lost a stanza, every downstream check would agree with the loss.
 *
 * So the ground truth is the page as it stood BEFORE any of this — read straight
 * out of git tag `atuona-pre-vault-tree-20260907`, never from a working file that
 * could have been edited. Each poem gets a SHA-256 over every field that IS the
 * poem: number, status, title, verse, badge, description, price, note and its
 * claim button. That is the lock. From then on, any change to any poem's content
 * or to any mint path fails the check, whoever made it and whenever.
 *
 * The first cut of this refactor shipped poem #045 wired to token 081 and a
 * verification that passed, because it compared a SORTED BAG of buttons rather
 * than which button belonged to which poem. Everything here is per-poem.
 *
 * Usage:
 *   node scripts/verify-vault.mjs --lock    (re)write content/poems.lock.json from the tag
 *   node scripts/verify-vault.mjs           verify index.html against the lock; exit 1 on any loss
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCards, fingerprint, fieldHashes, CONTENT_FIELDS, norm } from './lib/cards.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LOCK = join(ROOT, 'content', 'poems.lock.json');
const BASELINE_TAG = 'atuona-pre-vault-tree-20260907';

const LOCKING = process.argv.includes('--lock');
/* --file lets the guard test itself against deliberately corrupted copies.
   A verifier that has never failed is not evidence that it can. */
const fileArg = process.argv.indexOf('--file');
const HTML = fileArg > -1 ? process.argv[fileArg + 1] : join(ROOT, 'index.html');
const QUIET = process.argv.includes('--quiet');

/** Ground truth comes out of git, not off the disk. */
function baselineHtml() {
  try {
    return execFileSync('git', ['show', `${BASELINE_TAG}:index.html`],
      { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  } catch {
    throw new Error(`cannot read baseline from tag ${BASELINE_TAG} — the drop's ground truth is missing`);
  }
}

/* Anchors the NFT drop cannot lose. Each one is load-bearing:
   the thirdweb mount, the two module entry points, the wallet handler, the claim
   function, and the manifesto the site links from its own logo. */
const DROP_ANCHORS = [
  '<div id="root">',
  'src="/src/main.js"',
  'src="/src/main.jsx"',
  'class="nav-link space wallet-status"',
  'handleWalletConnection',
  'window.claimPoem',
  'id="manifestoModal"',
  'enhanceAllMintingButtons',
];

function mintFacts(html) {
  return {
    gallerySlots: (html.match(/class="gallery-slot"/g) || []).length,
    gallerySlotClaims: (html.match(/class="gallery-slot" onclick="claimPoem\(/g) || []).length,
    actionButtons: (html.match(/<button class="nft-action"/g) || []).length,
    anchors: DROP_ANCHORS.filter((a) => html.includes(a)),
  };
}

/* ── Lock ─────────────────────────────────────────────────────────────────── */
if (LOCKING) {
  const html = baselineHtml();
  const cards = parseCards(html);
  if (!cards.length) throw new Error('baseline parsed to zero poems — refusing to write an empty lock');

  const facts = mintFacts(html);
  const lock = {
    baseline: BASELINE_TAG,
    lockedAt: new Date().toISOString().slice(0, 10),
    note: 'Ground truth for atuona.xyz poem content and mint paths. Generated from the git tag, never from a working file. Do not hand-edit.',
    count: cards.length,
    verseChars: cards.reduce((a, c) => a + c.verseHtml.length, 0),
    mint: facts,
    poems: cards.map((c) => ({
      id: c.id,
      fingerprint: fingerprint(c),
      fields: fieldHashes(c),
      mints: /onclick\s*=/.test(c.buttonHtml),
    })),
  };
  writeFileSync(LOCK, JSON.stringify(lock, null, 2) + '\n', 'utf8');
  console.log(`locked ${lock.count} poems from ${BASELINE_TAG} → content/poems.lock.json`);
  console.log(`  verse chars: ${lock.verseChars} · action buttons: ${facts.actionButtons} · gallery slots: ${facts.gallerySlots}`);
  console.log(`  ${lock.poems.filter((p) => p.mints).length} of ${lock.count} carried an inline onclick`);
  process.exit(0);
}

/* ── Verify ───────────────────────────────────────────────────────────────── */
if (!existsSync(LOCK)) {
  console.error('no content/poems.lock.json — run: node scripts/verify-vault.mjs --lock');
  process.exit(1);
}
const lock = JSON.parse(readFileSync(LOCK, 'utf8'));
const html = readFileSync(HTML, 'utf8');
const cards = parseCards(html);
const byId = new Map(cards.map((c) => [c.id, c]));

const fail = [];
const warn = [];

/* 1 — every locked poem is still here, with every field intact. */
for (const want of lock.poems) {
  const got = byId.get(want.id);
  if (!got) { fail.push(`#${want.id} MISSING from the page`); continue; }
  if (fingerprint(got) === want.fingerprint) continue;
  const now = fieldHashes(got);
  const changed = CONTENT_FIELDS.filter((f) => now[f] !== want.fields[f]);
  fail.push(`#${want.id} content changed: ${changed.join(', ')}`);
}

/* 2 — and nothing has been invented. */
for (const c of cards) {
  if (!lock.poems.some((p) => p.id === c.id)) warn.push(`#${c.id} is NEW since the lock (re-lock deliberately if this is a real poem)`);
}
if (cards.length < lock.count) fail.push(`poem count fell: ${lock.count} locked, ${cards.length} on the page`);

/* 3 — no duplicates. A duplicated id means two rows claim one token. */
const seen = new Set();
for (const c of cards) {
  if (seen.has(c.id)) fail.push(`#${c.id} appears more than once`);
  seen.add(c.id);
}

/* 4 — PAIRING, not the bag. Each poem's own article must carry its own number,
   its own verse and its own claim button. This is the check whose absence let
   poem #045 ship wired to token 081. */
for (const c of cards) {
  const a = html.indexOf(`id="p${c.id}"`);
  if (a < 0) { fail.push(`#${c.id} has no addressable row (id="p${c.id}")`); continue; }
  const b = html.indexOf('</article>', a);
  if (b < 0) { fail.push(`#${c.id} row is not closed`); continue; }
  const row = norm(html.slice(a, b));
  const locked = lock.poems.find((p) => p.id === c.id);
  if (!row.includes(`<div class="nft-id">#${c.id}</div>`)) fail.push(`#${c.id} row carries a different number`);
  if (locked && !row.includes(c.buttonHtml)) fail.push(`#${c.id} row does not contain its own claim button`);
  if (!row.includes(c.verseHtml)) fail.push(`#${c.id} row does not contain its own verse`);

  /* The contents row displays its OWN copy of the number and title. Those are
     what a reader actually sees, and hashing only the card's <h2> left them
     unguarded — the guard test caught this by reworking #017's row title and
     sailing straight through. Both copies must agree with the locked card. */
  const shownTitle = (row.match(/<span class="poem-title">([\s\S]*?)<\/span>/) || [])[1];
  if (shownTitle === undefined) fail.push(`#${c.id} row shows no title`);
  else if (norm(shownTitle) !== c.titleHtml) {
    fail.push(`#${c.id} row title "${norm(shownTitle)}" does not match the poem's title "${c.titleHtml}"`);
  }
  const shownNum = (row.match(/<span class="poem-num">#([\s\S]*?)<\/span>/) || [])[1];
  if (norm(shownNum || '') !== c.id) fail.push(`#${c.id} row displays number #${norm(shownNum || '?')}`);
}

/* 5 — the mint must key on IDENTITY. Position-derived ids were correct only
   while nothing was reordered; the book reorders, so this can never come back. */
const enhance = html.slice(html.indexOf('function enhanceAllMintingButtons'), html.indexOf('function enhanceAllMintingButtons') + 2000);
if (!enhance) fail.push('enhanceAllMintingButtons is gone — the drop no longer wires its buttons');
else {
  if (!/querySelector\('\.nft-id'\)/.test(enhance)) fail.push('mint no longer reads the card\'s own .nft-id — token ids would come from DOM order again');
  const posFirst = enhance.indexOf("String(index + 1)");
  const idFirst = enhance.indexOf("querySelector('.nft-id')");
  if (posFirst >= 0 && idFirst >= 0 && posFirst < idFirst) fail.push('mint derives the token id from DOM position BEFORE identity');
}

/* 6 — the rest of the drop is untouched. */
/* The locked counts are a FLOOR, not an exact match. The vault gains a poem
   whenever Atuona publishes, and each one legitimately brings a claim button and
   a MINT slot with it — the first version failed the daily publish for growing.
   What must never happen is the count going DOWN: that is a poem, a button or a
   slot that has gone missing. */
const facts = mintFacts(html);
const floor = (now, was, label) => {
  if (now < was) fail.push(`${label} changed: ${was} → ${now}`);
  else if (now > was) warn.push(`${label}: ${was} → ${now} (new since the lock — re-lock deliberately)`);
};
floor(facts.gallerySlots, lock.mint.gallerySlots, 'MINT slots');
floor(facts.gallerySlotClaims, lock.mint.gallerySlotClaims, 'MINT slot claim handlers');
floor(facts.actionButtons, lock.mint.actionButtons, 'claim buttons');
for (const a of lock.mint.anchors) if (!html.includes(a)) fail.push(`drop anchor lost: ${a}`);

/* 7 — the text must still be in the document, not fetched. This is the GEO
   guarantee: collapsed is fine, absent is not. */
const verseChars = cards.reduce((a, c) => a + c.verseHtml.length, 0);
if (verseChars < lock.verseChars) fail.push(`verse text shrank: ${lock.verseChars} → ${verseChars} chars`);
if (/\.innerHTML\s*=\s*.{0,40}nft-verse/.test(html)) fail.push('a verse appears to be injected by script — it must be in the DOM at load');

/* 8 — the no-JavaScript fallback must still open everything. */
if (!html.includes('.vault.nojs .part-body') || !html.includes('.vault.nojs .poem-body')) {
  fail.push('the .nojs fallback is gone — with JS off the poems would be invisible');
}

/* ── Report ───────────────────────────────────────────────────────────────── */
const pad = (n) => String(n).padStart(3, ' ');
if (!QUIET) {
  console.log(`verify-vault — baseline ${lock.baseline}`);
  console.log(`  ${pad(cards.length)} poems on the page   (${lock.count} locked)`);
  console.log(`  ${pad(facts.actionButtons)} claim buttons       (${lock.mint.actionButtons} locked)`);
  console.log(`  ${pad(facts.gallerySlots)} MINT slots          (${lock.mint.gallerySlots} locked)`);
  console.log(`  ${verseChars} verse chars in the DOM (${lock.verseChars} locked)`);
  console.log(`  ${pad(lock.mint.anchors.length)} drop anchors present`);
  for (const w of warn) console.log(`  ⚠ ${w}`);
}

if (fail.length) {
  console.error(`${QUIET ? '' : '\n'}✗ FAILED — ${fail.length} problem(s):`);
  for (const f of fail.slice(0, 40)) console.error(`  · ${f}`);
  process.exit(1);
}
if (!QUIET) console.log('\n✓ every locked poem intact, every claim button paired to its own poem, drop anchors present.');
