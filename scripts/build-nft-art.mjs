#!/usr/bin/env node
/**
 * build-nft-art.mjs — pictures + metadata for the 45 on-chain ATUONA tokens (Elena, 25 Nov 2026)
 *
 * Why: every token's metadata (ipfs://QmXheK9…/<tokenId>) points its image at
 * fast-yottabyte-noisy.on-fleek.app/images/poem-NNN.png. That host answers 522,
 * was never archived, and the PNGs exist nowhere — so wallets showed a blank
 * tile. And MetaMask's default IPFS gateways (ipfs.io, dweb.link) now answer
 * 429, so new tokens showed no name either.
 *
 * What this does (local tool, run by hand, output committed):
 *   nft-src/orig/<tokenId>.json   the ORIGINAL metadata, fetched from IPFS — kept as the record
 *   public/nft/img/poem-NNN.png   a 1000×1000 card: the poem's own number, title, date and its
 *                                 opening lines from content/poems.json — no invented text
 *   public/nft/meta/<tokenId>     the original JSON with ONLY `image` changed (name, description,
 *                                 attributes byte-for-byte as minted)
 *
 * Nothing changes on-chain until the contract OWNER calls updateBatchBaseURI(0,
 * "https://atuona.xyz/nft/meta/") — see docs in cto-aipa NOW.md.
 *
 * Playwright is borrowed from the cto-aipa checkout (not a dependency of this site).
 * Usage: node scripts/build-nft-art.mjs [--only=34]
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire('D:/aideazz/ai-cofounders/cto-aipa/package.json');
const { chromium } = require('playwright');

const ORIG = join(ROOT, 'nft-src', 'orig');
const IMG = join(ROOT, 'public', 'nft', 'img');
const META = join(ROOT, 'public', 'nft', 'meta');
const SITE = 'https://atuona.xyz';
const OLD_IMAGE = /^https:\/\/fast-yottabyte-noisy\.on-fleek\.app\/images\/poem-(\d{3})\.png$/;
mkdirSync(IMG, { recursive: true }); mkdirSync(META, { recursive: true });

const only = (process.argv.find((a) => a.startsWith('--only=')) || '').split('=')[1];
const poems = JSON.parse(readFileSync(join(ROOT, 'content', 'poems.json'), 'utf8'));
const byId = new Map(poems.map((p) => [String(p.id), p]));

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const NOISE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .9 -.25'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E";

function card(p) {
  const lines = String(p.verse).split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const shown = lines.slice(0, 9);
  return `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Geologica:wght@600;700&family=Geist+Mono:wght@400;700&display=block" rel="stylesheet">
<style>
*{margin:0;box-sizing:border-box}
html,body{width:1000px;height:1000px;background:#141414;overflow:hidden}
body{position:relative;padding:74px 80px;color:#ebe8e3;font-family:'Geist Mono',monospace}
body::after{content:"";position:absolute;inset:0;background-image:url("${NOISE}");opacity:.12;pointer-events:none}
.top{display:flex;justify-content:space-between;align-items:center}
.logo{font-family:Syne;font-weight:800;font-size:44px;letter-spacing:-.04em;color:#b0353a}
.stamp{transform:rotate(-2.5deg);border:2px solid #b0353a;color:#b0353a;font-weight:700;font-size:15px;letter-spacing:.3em;padding:8px 14px 8px 18px;text-transform:uppercase}
.num{margin-top:70px;font-family:Syne;font-weight:800;font-size:150px;line-height:.9;letter-spacing:-.05em;color:#6e1a1f}
.title{margin-top:18px;font-family:Geologica,sans-serif;font-weight:700;font-size:${p.title.length > 26 ? 44 : 58}px;line-height:1.05;letter-spacing:-.02em;color:#ebe8e3}
.rule{width:120px;height:2px;background:#b0353a;margin:34px 0 28px}
.verse{font-size:21px;line-height:1.62;color:#cfcac2;max-height:${21 * 1.62 * 9}px;overflow:hidden}
.foot{position:absolute;left:80px;right:80px;bottom:64px;display:flex;justify-content:space-between;
  font-size:14px;letter-spacing:.26em;text-transform:uppercase;color:#8a857e}
.foot b{color:#b0353a;font-weight:700}
</style></head><body>
<div class="top"><div class="logo">ATUONA</div><div class="stamp">Underground Aesthetic</div></div>
<div class="num">#${esc(p.id)}</div>
<div class="title">${esc(p.title)}</div>
<div class="rule"></div>
<div class="verse">${shown.map(esc).join('<br>')}${lines.length > shown.length ? '<br>…' : ''}</div>
<div class="foot"><span>Gallery of Moments</span><span>${esc(p.date || p.year || '')}</span><b>atuona.xyz</b></div>
</body></html>`;
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1000, height: 1000 } });
let done = 0;
for (let token = 0; token < 45; token++) {
  if (only !== undefined && only !== '' && String(token) !== only) continue;
  const f = join(ORIG, `${token}.json`);
  if (!existsSync(f)) throw new Error(`missing original metadata for token ${token} — refusing to guess`);
  const meta = JSON.parse(readFileSync(f, 'utf8'));
  const m = OLD_IMAGE.exec(meta.image || '');
  if (!m) throw new Error(`token ${token}: unexpected image ${meta.image} — refusing`);
  const id = m[1];
  const idAttr = (meta.attributes || []).find((a) => a.trait_type === 'ID');
  if (!idAttr || idAttr.value !== id) throw new Error(`token ${token}: image says ${id}, ID trait says ${idAttr && idAttr.value}`);
  const p = byId.get(id);
  if (!p) throw new Error(`poem ${id} not in content/poems.json`);
  if (!meta.name.startsWith(p.title)) throw new Error(`token ${token}: name "${meta.name}" does not start with vault title "${p.title}"`);

  await page.setContent(card(p), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: join(IMG, `poem-${id}.png`), type: 'png' });

  const out = { ...meta, image: `${SITE}/nft/img/poem-${id}.png` };
  writeFileSync(join(META, String(token)), JSON.stringify(out, null, 2) + '\n', 'utf8');
  done++;
}
await browser.close();
console.log(`build-nft-art: ${done} cards + metadata written (only image changed; names, descriptions, attributes as minted).`);
