#!/usr/bin/env node
/**
 * extract-poems.mjs — lift the 99 poem cards out of index.html into content/poems.json
 *
 * One-time-ish extraction, but idempotent: run it again after a publish and it picks
 * up whatever is currently in the VAULT. index.html has been hand-edited for a year
 * and has already drifted (poem #099 shipped with the generator's refusal string as
 * its title), so the point of this file is to make the DATA the thing we keep and the
 * markup the thing we render.
 *
 * Usage: node scripts/extract-poems.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const HTML = join(ROOT, 'index.html');
const OUT = join(ROOT, 'content', 'poems.json');

const html = readFileSync(HTML, 'utf8');

const homeStart = html.indexOf('<section id="home"');
const aboutStart = html.indexOf('<section id="about"');
if (homeStart < 0 || aboutStart < 0) throw new Error('cannot find #home / #about section boundaries');
const home = html.slice(homeStart, aboutStart);

// The cards are uniform: header (id + status), then content (title, verse, badge,
// description, meta). Anchored on `<div class="nft-card">` so a malformed card fails
// loudly at the count check below rather than silently merging into its neighbour.
const CARD = /<div class="nft-card">([\s\S]*?)(?=<div class="nft-card">|$)/g;

const F = {
  id:      /<div class="nft-id">#(\d+)<\/div>/,
  status:  /<div class="nft-status ([a-z]+)">([^<]*)<\/div>/,
  title:   /<h2 class="nft-title">([\s\S]*?)<\/h2>/,
  verse:   /<div class="nft-verse">([\s\S]*?)<\/div>/,
  badge:   /<div class="blockchain-badge">\s*<span>[^<]*<\/span>\s*([\s\S]*?)<\/div>/,
  desc:    /<p class="nft-description">([\s\S]*?)<\/p>/,
  price:   /<div class="nft-price">([\s\S]*?)<\/div>/,
  action:  /<button class="nft-action"[^>]*>([\s\S]*?)<\/button>/,
  note:    /<small [^>]*>([\s\S]*?)<\/small>/,
  // The claim button is carried VERBATIM, attributes and all. This is an NFT drop:
  // `onclick="claimPoem('045', '…')"` is the mint, and 44 of the 99 buttons carry no
  // onclick at all. Re-rendering it from parsed parts would quietly rewire the drop,
  // so the raw string is what gets stored and what gets emitted.
  buttonHtml: /<button class="nft-action"[\s\S]*?<\/button>/,
};

const tidy = (s) => (s || '').replace(/\s+/g, ' ').trim();

/**
 * Verses are HTML, not plain text — they carry <br>, and some carry <strong>/<em>
 * and raw `&`. So the markup is kept VERBATIM and only re-indented; nothing is
 * escaped, decoded or re-encoded on the way through. Round-tripping a poem through
 * an escaper is how you silently turn `&` into `&amp;amp;` on a page that is
 * supposed to be the permanent copy.
 */
const verseHtmlOf = (s) =>
  s.split('\n')
   .map((l) => l.replace(/\s+/g, ' ').trim())
   .filter((l, i, a) => l || (i > 0 && i < a.length - 1))
   .join('\n')
   .trim();

/** Tags stripped — used only for the contents row's taster line and the find index. */
const textOf = (html) =>
  (html || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .split('\n')
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june',
                'july', 'august', 'september', 'october', 'november', 'december'];

/**
 * `принято к публикации at LITPROM 29-08-2025` → venue + ISO date.
 *
 * #047 is the one card that never got the stamp — it reads
 * `PRESERVED ON BLOCKCHAIN - DECEMBER 2025`, so month-name form is handled too and
 * the venue falls back to the ATUONA era it sits in (#047+ is all self-published).
 * A poem with no readable year at all is left null and reported, never guessed.
 */
function readBadge(badge, num) {
  const text = tidy(badge);
  let venue = /LITPROM/i.test(text) ? 'LITPROM' : /ATUONA/i.test(text) ? 'ATUONA' : null;
  if (!venue) venue = num <= 46 ? 'LITPROM' : 'ATUONA';

  const dmy = text.match(/(\d{2})-(\d{2})-(\d{4})/);
  if (dmy) return { text, venue, date: `${dmy[3]}-${dmy[2]}-${dmy[1]}`, precision: 'day' };

  const my = text.match(new RegExp(`(${MONTHS.join('|')})\\s+(\\d{4})`, 'i'));
  if (my) {
    const mm = String(MONTHS.indexOf(my[1].toLowerCase()) + 1).padStart(2, '0');
    return { text, venue, date: `${my[2]}-${mm}`, precision: 'month' };
  }

  const y = text.match(/\b(20\d{2})\b/);
  if (y) return { text, venue, date: y[1], precision: 'year' };

  return { text, venue, date: null, precision: null };
}

const poems = [];
let m;
while ((m = CARD.exec(home))) {
  const body = m[1];
  const get = (re, i = 1) => { const hit = body.match(re); return hit ? hit[i] : ''; };

  const id = get(F.id);
  if (!id) continue; // the grid wrapper itself, not a card

  const badge = readBadge(get(F.badge), Number(id));
  const verseHtml = verseHtmlOf(get(F.verse));
  const verse = textOf(verseHtml);
  if (!verse) throw new Error(`poem #${id} has no verse body — refusing to write a hollow record`);

  const buttonHtml = get(F.buttonHtml, 0);
  if (!buttonHtml) throw new Error(`poem #${id} has no claim button — this is an NFT drop, refusing to drop one`);

  poems.push({
    id,
    num: Number(id),
    status: tidy(get(F.status, 2)) || 'LIVE',
    statusClass: get(F.status, 1) || 'live',
    titleHtml: tidy(get(F.title)),
    title: textOf(tidy(get(F.title))),
    verseHtml,
    verse,
    badge: badge.text,
    venue: badge.venue,
    date: badge.date,
    datePrecision: badge.precision,
    year: badge.date ? badge.date.slice(0, 4) : null,
    lang: /[а-яё]/i.test(verse) ? 'ru' : 'en',
    descriptionHtml: tidy(get(F.desc)),
    description: textOf(tidy(get(F.desc))),
    badgeHtml: tidy(get(F.badge)),
    price: tidy(get(F.price)),
    action: tidy(get(F.action)),
    note: tidy(get(F.note)),
    buttonHtml,
    mints: /onclick\s*=/.test(buttonHtml),
  });
}

// Loud checks. A quiet extractor that drops a poem is exactly the failure mode this
// whole exercise exists to remove.
const ids = poems.map((p) => p.id);
const dupes = ids.filter((v, i) => ids.indexOf(v) !== i);
if (dupes.length) throw new Error(`duplicate poem ids: ${dupes.join(', ')}`);

const cardCount = (home.match(/<div class="nft-card">/g) || []).length;
if (poems.length !== cardCount) {
  throw new Error(`parsed ${poems.length} poems but index.html has ${cardCount} cards — a card did not match the shape`);
}

poems.sort((a, b) => a.num - b.num);

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(poems, null, 2) + '\n', 'utf8');

const byVenue = poems.reduce((a, p) => ((a[p.venue] = (a[p.venue] || 0) + 1), a), {});
console.log(`extracted ${poems.length} poems → content/poems.json`);
console.log('  by venue:', Object.entries(byVenue).map(([k, v]) => `${k} ${v}`).join(' · '));
console.log('  by lang :', `ru ${poems.filter((p) => p.lang === 'ru').length} · en ${poems.filter((p) => p.lang === 'en').length}`);
console.log('  mintable:', `${poems.filter((p) => p.mints).length} of ${poems.length} carry an onclick`);
const undated = poems.filter((p) => !p.date);
if (undated.length) console.log('  ⚠ undated:', undated.map((p) => '#' + p.id).join(', '));
