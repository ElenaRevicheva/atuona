#!/usr/bin/env node
/**
 * test-vault-guards.mjs — attack the vault and prove the guard notices.
 *
 * verify-vault.mjs passing on a good page proves almost nothing: a check that
 * always returns "fine" also passes. What matters is whether it FAILS when the
 * page is actually damaged. So this takes the real index.html, corrupts a copy
 * one way at a time — each one a real thing that could happen to this repo — and
 * asserts the verifier rejects every single one.
 *
 * `claim-buttons-swapped` is the exact bug that shipped in the first cut of the
 * book: poem #045 wired to token 081. The verification in place at the time
 * passed it, because it compared a sorted bag of buttons rather than the pairing.
 *
 * `row-title-reworded` exists because this suite found it. The first version of
 * the verifier hashed only the card's <h2> and never looked at the title shown in
 * the contents row — so a poem's visible name could be changed with nothing
 * complaining. That is what an attack suite is for.
 *
 * Nothing here touches index.html. Every mutation is applied to a temp copy.
 *
 * Usage: node scripts/test-vault-guards.mjs
 */

import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const HTML = join(ROOT, 'index.html');
const VERIFY = join(ROOT, 'scripts', 'verify-vault.mjs');

const clean = readFileSync(HTML, 'utf8');
const tmp = mkdtempSync(join(tmpdir(), 'atuona-guard-'));

/** Run the verifier against a mutated copy. Returns {ok, out}. */
function check(html, name) {
  const path = join(tmp, `${name}.html`);
  writeFileSync(path, html, 'utf8');
  try {
    execFileSync('node', [VERIFY, '--file', path, '--quiet'],
      { cwd: ROOT, encoding: 'utf8', stdio: 'pipe' });
    return { ok: true, out: '' };
  } catch (e) {
    return { ok: false, out: String(e.stdout || '') + String(e.stderr || '') };
  }
}

/** Body of one poem's <article>, so mutations hit exactly one poem. */
function article(html, id) {
  const a = html.indexOf(`id="p${id}"`);
  const b = html.indexOf('</article>', a);
  if (a < 0 || b < 0) throw new Error(`cannot isolate #${id} to attack it`);
  return { a, b, text: html.slice(a, b) };
}

const ATTACKS = [
  {
    name: 'stanza-deleted',
    what: 'delete four lines from the middle of poem #003',
    expect: /#003 content changed|does not contain its own verse|verse text shrank/,
    mutate(html) {
      const { a, b, text } = article(html, '003');
      const lines = text.split('<br>');
      if (lines.length < 12) throw new Error('#003 shorter than expected');
      lines.splice(6, 4);
      return html.slice(0, a) + lines.join('<br>') + html.slice(b);
    },
  },
  {
    name: 'card-title-reworded',
    what: "reword the title inside poem #017's card",
    expect: /#017 content changed|row title .* does not match/,
    mutate(html) {
      const { a, b, text } = article(html, '017');
      return html.slice(0, a) +
        text.replace('<h2 class="nft-title">Guest</h2>', '<h2 class="nft-title">Guest (draft)</h2>') +
        html.slice(b);
    },
  },
  {
    name: 'row-title-reworded',
    what: "reword the title shown in poem #017's CONTENTS row — the one a reader sees",
    expect: /row title .* does not match/,
    mutate(html) {
      const { a, b, text } = article(html, '017');
      return html.slice(0, a) +
        text.replace('<span class="poem-title">Guest</span>', '<span class="poem-title">Guest (draft)</span>') +
        html.slice(b);
    },
  },
  {
    name: 'row-number-altered',
    what: "change the number shown on poem #017's row to #018",
    expect: /row displays number|row title .* does not match/,
    mutate(html) {
      const { a, b, text } = article(html, '017');
      return html.slice(0, a) +
        text.replace('<span class="poem-num">#017</span>', '<span class="poem-num">#018</span>') +
        html.slice(b);
    },
  },
  {
    name: 'claim-buttons-swapped',
    what: "swap poem #045's claim button with #081's — the bug that actually shipped",
    expect: /does not contain its own claim button|content changed/,
    mutate(html) {
      const A = article(html, '045');
      const B = article(html, '081');
      const btn = /<button class="nft-action"[\s\S]*?<\/button>/;
      const aBtn = A.text.match(btn), bBtn = B.text.match(btn);
      if (!aBtn || !bBtn) throw new Error('could not find both claim buttons');
      // Replace the later one first so the earlier offsets stay valid.
      const [lo, hi] = A.a < B.a ? [A, B] : [B, A];
      const [loBtn, hiBtn] = A.a < B.a ? [aBtn[0], bBtn[0]] : [bBtn[0], aBtn[0]];
      let out = html.slice(0, hi.a) + hi.text.replace(hiBtn, loBtn) + html.slice(hi.b);
      const lo2 = article(out, A.a < B.a ? '045' : '081');
      return out.slice(0, lo2.a) + lo2.text.replace(loBtn, hiBtn) + out.slice(lo2.b);
    },
  },
  {
    name: 'mint-back-to-position',
    what: 'revert the mint to deriving token ids from DOM position',
    expect: /DOM order again|DOM position BEFORE identity/,
    mutate(html) {
      return html.replace(
        /const idEl = card\.querySelector\('\.nft-id'\);[\s\S]*?:\s*String\(index \+ 1\)\.padStart\(3, '0'\);/,
        `const poemId = String(index + 1).padStart(3, '0');`);
    },
  },
  {
    name: 'poem-dropped',
    what: 'remove poem #062 entirely',
    expect: /#062 MISSING|poem count fell/,
    mutate(html) {
      const a = html.indexOf('<article class="poem" id="p062"');
      const b = html.indexOf('</article>', a) + '</article>'.length;
      if (a < 0) throw new Error('#062 not found');
      return html.slice(0, a) + html.slice(b);
    },
  },
  {
    name: 'nojs-fallback-removed',
    what: 'drop the no-JavaScript fallback, hiding all 99 poems from a JS-off reader',
    expect: /\.nojs fallback is gone/,
    mutate(html) {
      return html.replace('.vault.nojs .part-body,.vault.nojs .poem-body{max-height:none;overflow:visible;}', '');
    },
  },
  {
    name: 'mint-slot-lost',
    what: 'lose one MINT gallery slot',
    expect: /MINT slots changed|MINT slot claim handlers changed/,
    mutate(html) {
      const a = html.indexOf('<div class="gallery-slot"');
      const b = html.indexOf('</div>', html.indexOf('</div>', a) + 6) + 6;
      return html.slice(0, a) + html.slice(b);
    },
  },
];

/**
 * Changes that MUST still pass. A guard that rejects everything is as useless as
 * one that accepts everything, and the reorder case is the whole point of the
 * book: the poems are deliberately not in numeric DOM order any more, so the
 * verifier must be indifferent to their position while staying strict about
 * their content. Proven live too — serving a fully reordered page put the vault
 * in the order 027, 028, 029… and all 99 tokens still minted correctly.
 */
const CONTROLS = [
  {
    name: 'poems-reordered',
    what: 'reverse the position of all 99 poems — content untouched',
    mutate(html) {
      const re = /<article class="poem"[\s\S]*?<\/article>/g;
      const arts = html.match(re);
      if (!arts || arts.length !== 99) throw new Error(`expected 99 articles, found ${arts ? arts.length : 0}`);
      let i = arts.length;
      return html.replace(re, () => arts[--i]);
    },
  },
];

console.log('test-vault-guards — corrupting a copy of index.html, one way at a time\n');

let passed = 0;
const problems = [];

// Control: the real page must pass, or every result below is meaningless.
const control = check(clean, 'control');
if (!control.ok) {
  console.error('✗ CONTROL FAILED — the real page does not verify, so these tests prove nothing:');
  console.error(control.out);
  rmSync(tmp, { recursive: true, force: true });
  process.exit(1);
}
console.log('  ✓ control            the untouched page verifies');

for (const atk of ATTACKS) {
  let res;
  try {
    res = check(atk.mutate(clean), atk.name);
  } catch (e) {
    problems.push(`${atk.name}: could not apply the attack — ${e.message}`);
    console.log(`  ? ${atk.name.padEnd(20)} SKIPPED (${e.message})`);
    continue;
  }
  if (res.ok) {
    problems.push(`${atk.name}: the guard PASSED a corrupted page — ${atk.what}`);
    console.log(`  ✗ ${atk.name.padEnd(20)} NOT CAUGHT — ${atk.what}`);
  } else if (!atk.expect.test(res.out)) {
    problems.push(`${atk.name}: caught, but for the wrong reason:\n${res.out.trim()}`);
    console.log(`  ~ ${atk.name.padEnd(20)} caught for the wrong reason`);
  } else {
    passed++;
    const why = (res.out.match(/· (.+)/) || [, ''])[1];
    console.log(`  ✓ ${atk.name.padEnd(20)} caught — ${why.trim().slice(0, 72)}`);
  }
}

for (const ctl of CONTROLS) {
  let res;
  try {
    res = check(ctl.mutate(clean), ctl.name);
  } catch (e) {
    problems.push(`${ctl.name}: could not apply — ${e.message}`);
    console.log(`  ? ${ctl.name.padEnd(20)} SKIPPED (${e.message})`);
    continue;
  }
  if (res.ok) {
    passed++;
    console.log(`  ✓ ${ctl.name.padEnd(20)} still passes — ${ctl.what}`);
  } else {
    problems.push(`${ctl.name}: the guard REJECTED a legitimate change — ${ctl.what}\n${res.out.trim()}`);
    console.log(`  ✗ ${ctl.name.padEnd(20)} WRONGLY REJECTED — ${ctl.what}`);
  }
}

rmSync(tmp, { recursive: true, force: true });

console.log(`\n${passed}/${ATTACKS.length + CONTROLS.length} checks correct (${ATTACKS.length} attacks caught, ${CONTROLS.length} legitimate change accepted).`);
if (problems.length) {
  console.error('\n✗ the guard is not iron-clad:');
  for (const p of problems) console.error(`  · ${p}`);
  process.exit(1);
}
console.log('✓ every corruption of poem content or the mint path is rejected.');
