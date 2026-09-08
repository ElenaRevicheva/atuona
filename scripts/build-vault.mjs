#!/usr/bin/env node
/**
 * build-vault.mjs — render content/poems.json into the VAULT tree inside index.html
 *
 * ── Why this exists ─────────────────────────────────────────────────────────
 * The vault reached ninety-nine poems, every one expanded, in one flat column:
 * 4,456 lines of DOM between the hero and the manifesto. Reaching #045 meant
 * scrolling past forty-four complete poems. The AI Ops Wiki hit the same wall at
 * fifty chapters and its own source says why — a collection that gains an entry
 * every week cannot open with every entry on screen.
 *
 * So the vault is set as a book: PART → POEM → the text. You see the run of
 * names first, open the one you want, and only then does the poem unfold.
 *
 * ── The three rules ─────────────────────────────────────────────────────────
 * 1. EVERY POEM IS IN THE DOM AT LOAD, collapsed with CSS. Never injected, never
 *    fetched on click. The whole GEO/AEO position of this site is that answer
 *    engines read the full text of all ninety-nine; a virtualised list would make
 *    it invisible to exactly the crawlers it is optimised for.
 * 2. DISCLOSURE BY MEASURED max-height, not `grid-template-rows: 0fr -> 1fr`.
 *    The wiki shipped the tidy modern recipe and it failed CLOSED — the engine
 *    cannot interpolate an fr, so every chapter stayed shut while the class, the
 *    aria state and the counter all agreed it was open. Here that bug would hide
 *    ninety-nine poems behind a page that looked fine.
 * 3. THIS IS AN NFT DROP. Claim buttons are carried through byte-for-byte from
 *    poems.json — attributes, onclick, the lot. Nothing in the mint path is
 *    re-rendered from parsed parts.
 *
 * Usage:
 *   node scripts/build-vault.mjs           write the tree into index.html
 *   node scripts/build-vault.mjs --check   build and diff, write nothing
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { UNIT, count as unitCount } from './lib/words.mjs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const HTML = join(ROOT, 'index.html');
const DATA = join(ROOT, 'content', 'poems.json');
const CHECK = process.argv.includes('--check');

const poems = JSON.parse(readFileSync(DATA, 'utf8'));

const MARK_START = '<!-- VAULT:TREE:START -->';
const MARK_END = '<!-- VAULT:TREE:END -->';

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttr = (s) => esc(s).replace(/"/g, '&quot;');

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function fmtDate(p) {
  if (!p.date) return '';
  const [y, m, d] = p.date.split('-');
  if (p.datePrecision === 'day') return `${Number(d)} ${MON[Number(m) - 1]} ${y}`;
  if (p.datePrecision === 'month') return `${MON[Number(m) - 1]} ${y}`;
  return y;
}

/**
 * First real line of the poem, for the contents row — the taster, like a chapter
 * subtitle. Skips a line that merely repeats the title (several poems open with
 * their own name, and a row reading "The Secret Exhibition / The secret exhibition"
 * tells the reader nothing), and skips a bare all-caps heading when a real line
 * follows it.
 */
function taster(p) {
  const title = p.title.trim().toLowerCase().replace(/[.…]+$/, '');
  const lines = p.verse.split('\n').map((l) => l.trim()).filter(Boolean);
  const line = lines.find((l) => {
    const bare = l.toLowerCase().replace(/[.…]+$/, '');
    if (bare === title) return false;                       // just the title again
    if (l.toUpperCase() === l && l.length <= 28) return false; // a caps heading
    return true;
  }) || lines.find((l) => l.toLowerCase().replace(/[.…]+$/, '') !== title) || lines[0] || '';
  return line.length > 96 ? line.slice(0, 95).replace(/[\s,;:.—–-]+$/, '') + '…' : line;
}

/* ── The parts ───────────────────────────────────────────────────────────────
   Not invented: every card already carries its venue, stamped by whoever
   published it. ATUONA leads because it is the work she is doing now; LITPROM
   is the archive it grew out of. Newest first inside each, the way the wiki
   lists its chapters. */
const PARTS = [
  {
    key: 'atuona', num: 'PART I', title: 'ATUONA',
    note: 'Self-published, on-chain, from Panama',
    venue: 'ATUONA',
  },
  {
    key: 'litprom', num: 'PART II', title: 'LITPROM',
    note: 'Published by the Redkollegiya, in Russia',
    venue: 'LITPROM',
  },
];

function poemRow(p) {
  const id = `p${p.id}`;
  const date = fmtDate(p);
  const sub = taster(p);
  // The find index is plain text: number, title, and the taster. Typing "045" or
  // "каблук" or "eternity" all reach the same row.
  const find = `${p.id} ${p.num} ${p.title} ${sub}`.toLowerCase();

  return `        <article class="poem" id="${id}" data-find="${escAttr(find)}">
          <h4 class="poem-h">
            <button class="poem-btn" type="button" aria-expanded="false" aria-controls="${id}-body">
              <span class="poem-num">#${esc(p.id)}</span>
              <span class="poem-txt">
                <span class="poem-title">${p.titleHtml}</span>
                <span class="poem-sub">${esc(sub)}</span>
              </span>
              <span class="poem-side">
                <span class="poem-status ${esc(p.statusClass)}">${esc(p.status)}</span>
                <span class="poem-lang">${esc(p.lang.toUpperCase())}</span>
                <span class="poem-date">${esc(date)}</span>
                <span class="poem-leader" aria-hidden="true"></span>
                <span class="poem-open">Read<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></span>
              </span>
            </button>
          </h4>
          <div class="poem-body" id="${id}-body">
            <div class="poem-in">
              <div class="nft-card">
                <div class="nft-header">
                  <div class="nft-id">#${esc(p.id)}</div>
                  <div class="nft-status ${esc(p.statusClass)}">${esc(p.status)}</div>
                </div>
                <div class="nft-content">
                  <h2 class="nft-title">${p.titleHtml}</h2>
                  <div class="nft-verse">${p.verseHtml}</div>
                  <div class="blockchain-badge">
                    <span>●</span> ${p.badgeHtml}
                  </div>
                  <p class="nft-description">${p.descriptionHtml}</p>
                  <div class="nft-meta">
                    <div class="nft-price">${esc(p.price)}</div>
                    ${p.buttonHtml}
                    <small style="color: var(--silver-grey); font-size: 0.7rem; margin-top: 0.5rem; display: block; font-family: 'JetBrains Mono', monospace;">${esc(p.note)}</small>
                  </div>
                </div>
              </div>
              <a class="poem-permalink" href="#${id}">#${esc(p.id)} — permalink</a>
            </div>
          </div>
        </article>`;
}

function partBlock(part, idx) {
  const mine = poems.filter((p) => p.venue === part.venue).sort((a, b) => b.num - a.num);
  if (!mine.length) throw new Error(`part ${part.title} matched no poems — check the venue stamps`);

  const lo = Math.min(...mine.map((p) => p.num));
  const hi = Math.max(...mine.map((p) => p.num));
  const pad = (n) => String(n).padStart(3, '0');

  // Year runs, newest first. A run is a label, not a container — the poems stay
  // siblings so the find filter never has to reason about nesting.
  const years = [...new Set(mine.map((p) => p.year))].sort((a, b) => Number(b) - Number(a));
  const body = years.map((y) => {
    const run = mine.filter((p) => p.year === y);
    return `        <div class="run"><span class="run-y">${esc(y)}</span><span class="run-rule" aria-hidden="true"></span><span class="run-n">${unitCount(run.length)}</span></div>
${run.map(poemRow).join('\n')}`;
  }).join('\n');

  const langs = [...new Set(mine.map((p) => p.lang))];
  const langNote = langs.length > 1 ? 'RU + EN' : langs[0].toUpperCase();

  return `      <section class="part" id="part-${part.key}" style="--d:${idx}">
        <h3 class="part-h">
          <button class="part-btn" type="button" aria-expanded="false" aria-controls="part-${part.key}-body">
            <span class="part-num">${esc(part.num)}</span>
            <span class="part-txt">
              <span class="part-title">${esc(part.title)}</span>
              <span class="part-note">${esc(part.note)} · #${pad(lo)}–#${pad(hi)} · ${langNote}</span>
            </span>
            <span class="part-side">
              <span class="part-count">${unitCount(mine.length)}</span>
              <span class="part-mark" aria-hidden="true"></span>
            </span>
          </button>
        </h3>
        <div class="part-body" id="part-${part.key}-body">
          <div class="part-in">
            <!-- VAULT:INSERT:${part.title} -->
${body}
          </div>
        </div>
      </section>`;
}

const CSS = `
    /* ── The VAULT, set as a book ──────────────────────────────────────────
       Generated by scripts/build-vault.mjs. Do not hand-edit: this block is
       overwritten on every build, which is the whole point — index.html had
       been hand-edited for a year and had already drifted. */
    .vault{max-width:1080px;margin:0 auto;padding:0 1rem 4rem;}
    .vault-head{border-top:2px solid var(--red-dark);padding-top:1.6rem;margin-bottom:.6rem;}
    .vault-kicker{font-family:var(--font-mono,'JetBrains Mono',monospace);font-size:.66rem;letter-spacing:.34em;
      text-transform:uppercase;color:var(--red-crimson);margin-bottom:.7rem;}
    .vault-title{font-family:var(--font-display,'Space Grotesk','Inter',sans-serif);font-weight:700;font-size:clamp(1.8rem,4.2vw,2.7rem);
      letter-spacing:-.03em;color:var(--silver-bright);margin:0 0 .7rem;}
    .vault-note{color:var(--silver-dark);font-size:.92rem;line-height:1.65;max-width:60ch;margin:0 0 1.4rem;}
    .vault-tools{display:flex;flex-wrap:wrap;gap:.8rem;align-items:center;
      padding-bottom:1.3rem;border-bottom:1px solid var(--grey-dark);}
    .vault-find{flex:1 1 260px;min-width:0;background:rgba(0,0,0,.5);border:1px solid var(--grey-medium);
      color:var(--silver-bright);font-family:var(--font-mono,'JetBrains Mono',monospace);font-size:.78rem;
      padding:.68rem .9rem;letter-spacing:.04em;transition:border-color .25s;}
    .vault-find::placeholder{color:var(--grey-light);}
    .vault-find:focus{outline:none;border-color:var(--red-crimson);}
    .vault-tally{font-family:var(--font-mono,'JetBrains Mono',monospace);font-size:.68rem;letter-spacing:.16em;
      text-transform:uppercase;color:var(--silver-dark);white-space:nowrap;}
    .vault-empty{display:none;padding:2.4rem 0;color:var(--silver-dark);font-family:var(--font-mono,'JetBrains Mono',monospace);
      font-size:.8rem;letter-spacing:.06em;}
    .vault.finding .vault-empty.on{display:block;}

    /* Numerals in true columns: #045, the dates and the tallies stop shimmering
       by a pixel from row to row. Set here rather than in the type layer because
       this sheet ships inside the body and would otherwise win against it. */
    .poem-num,.poem-date,.part-count,.run-y,.run-n,.vault-tally,.nft-id{
      font-variant-numeric:tabular-nums;font-feature-settings:"tnum" 1;}

    /* ── Level one: the parts ───────────────────────────────────────────── */
    .part{border-bottom:1px solid var(--grey-dark);}
    .part-h{margin:0;font-weight:400;}
    .part-btn{width:100%;display:flex;align-items:baseline;gap:1.1rem;text-align:left;cursor:pointer;
      background:none;border:0;padding:1.5rem .3rem;color:inherit;font:inherit;
      transition:background .3s,padding-left .3s;}
    .part-btn:hover{background:rgba(139,0,0,.09);padding-left:.75rem;}
    .part-btn:focus-visible{outline:2px solid var(--red-crimson);outline-offset:2px;}
    .part-num{font-family:var(--font-mono,'JetBrains Mono',monospace);font-size:.66rem;letter-spacing:.24em;
      color:var(--red-crimson);flex:0 0 auto;min-width:4.6rem;}
    .part-txt{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:.34rem;}
    .part-title{font-family:var(--font-display,'Space Grotesk','Inter',sans-serif);font-size:clamp(1.3rem,2.8vw,1.9rem);
      font-weight:800;letter-spacing:.08em;color:var(--silver-bright);}
    .part-note{font-family:var(--font-mono,'JetBrains Mono',monospace);font-size:.68rem;letter-spacing:.08em;
      color:var(--silver-dark);}
    .part-side{flex:0 0 auto;display:flex;align-items:center;gap:.9rem;}
    .part-count{font-family:var(--font-mono,'JetBrains Mono',monospace);font-size:.66rem;letter-spacing:.14em;
      color:var(--grey-light);white-space:nowrap;}
    /* A plus that becomes a minus. It says "this contains things", not "go here". */
    .part-mark{position:relative;width:22px;height:22px;border:1px solid var(--grey-medium);flex:0 0 auto;}
    .part-mark::before,.part-mark::after{content:"";position:absolute;background:var(--silver-dark);
      top:50%;left:50%;transform:translate(-50%,-50%);transition:transform .35s cubic-bezier(.2,.8,.2,1);}
    .part-mark::before{width:10px;height:1px;}
    .part-mark::after{width:1px;height:10px;}
    .part.open .part-mark{border-color:var(--red-crimson);background:var(--red-dark);}
    .part.open .part-mark::before,.part.open .part-mark::after{background:var(--silver-bright);}
    .part.open .part-mark::after{transform:translate(-50%,-50%) scaleY(0);}

    /* See rule 2 in the header: measured max-height, released to none once the
       transition ends so a poem opening inside an already-open part can still
       grow. If the transition never fires, the measured height is already
       applied and the text is simply visible. There is no state in which the
       decoration can hide the poem. */
    .part-body,.poem-body{overflow:hidden;max-height:0;
      transition:max-height .5s cubic-bezier(.2,.8,.2,1);}
    .part-in{padding:0 0 1.2rem;}

    /* ── The year runs ──────────────────────────────────────────────────── */
    .run{display:flex;align-items:center;gap:.9rem;padding:1.5rem .3rem .6rem;}
    .run-y{font-family:var(--font-mono,'JetBrains Mono',monospace);font-size:.8rem;letter-spacing:.2em;color:var(--red-crimson);}
    .run-rule{flex:1 1 auto;height:1px;background:var(--grey-dark);}
    .run-n{font-family:var(--font-mono,'JetBrains Mono',monospace);font-size:.62rem;letter-spacing:.14em;color:var(--grey-light);}
    .vault.finding .run{display:none;}

    /* ── Level two: one poem, one row ───────────────────────────────────── */
    .poem{border-bottom:1px solid rgba(42,42,42,.7);}
    .poem[hidden]{display:none;}
    .poem-h{margin:0;font-weight:400;}
    .poem-btn{width:100%;display:flex;align-items:baseline;gap:1rem;text-align:left;cursor:pointer;
      background:none;border:0;padding:.95rem .3rem;color:inherit;font:inherit;
      transition:background .28s,padding-left .28s;}
    .poem-btn:hover{background:rgba(139,0,0,.07);padding-left:.7rem;}
    .poem-btn:focus-visible{outline:2px solid var(--red-crimson);outline-offset:2px;}
    .poem-num{font-family:var(--font-mono,'JetBrains Mono',monospace);font-size:.72rem;letter-spacing:.08em;
      color:var(--grey-light);flex:0 0 auto;min-width:3.1rem;}
    .poem.open .poem-num{color:var(--red-crimson);}
    .poem-txt{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:.24rem;}
    /* Her ask: every row carries the poem's NAME, the way a wiki chapter does. */
    .poem-title{font-family:var(--font-title,'Geologica','Inter',sans-serif);font-size:1.06rem;font-weight:600;
      color:var(--silver-bright);letter-spacing:-.015em;}
    .poem.open .poem-title{color:var(--red-crimson);}
    .poem-sub{font-size:.8rem;color:var(--grey-light);line-height:1.45;
      overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
    .poem-side{flex:0 0 auto;display:flex;align-items:center;gap:.75rem;}
    .poem-status{font-family:var(--font-mono,'JetBrains Mono',monospace);font-size:.55rem;letter-spacing:.14em;
      padding:.2rem .45rem;border:1px solid var(--grey-medium);color:var(--grey-light);}
    .poem-status.live{border-color:var(--red-dark);color:var(--red-crimson);}
    .poem-lang{font-family:var(--font-mono,'JetBrains Mono',monospace);font-size:.58rem;letter-spacing:.14em;color:var(--grey-light);}
    .poem-date{font-family:var(--font-mono,'JetBrains Mono',monospace);font-size:.63rem;letter-spacing:.06em;
      color:var(--silver-dark);white-space:nowrap;min-width:6.4rem;text-align:right;}
    .poem-leader{width:2.2rem;height:1px;background:var(--grey-dark);}
    .poem-open{display:inline-flex;align-items:center;gap:.3rem;font-family:var(--font-mono,'JetBrains Mono',monospace);
      font-size:.58rem;letter-spacing:.16em;text-transform:uppercase;color:var(--red-crimson);white-space:nowrap;}
    .poem.open .poem-open svg{transform:rotate(90deg);}
    .poem-open svg{transition:transform .35s cubic-bezier(.2,.8,.2,1);}

    /* The card itself is UNCHANGED — same .nft-card / .nft-header / .nft-content
       markup, so every rule it has ever had still applies: ground, border, blur,
       the gradient sweep, the hover lift, the pulsing LIVE chip. Nothing here
       overrides it. A transform does not affect scrollHeight, so the lift cannot
       disturb the measured panel either. */
    .poem-in{padding:.4rem 0 2rem 3.1rem;}
    .poem-permalink{display:inline-block;margin-top:1.1rem;font-family:var(--font-mono,'JetBrains Mono',monospace);
      font-size:.6rem;letter-spacing:.14em;text-transform:uppercase;color:var(--grey-light);
      text-decoration:none;border-bottom:1px solid var(--grey-dark);transition:color .25s,border-color .25s;}
    .poem-permalink:hover{color:var(--red-crimson);border-color:var(--red-dark);}
    /* A row reached by permalink says so for a beat, then settles. */
    .poem.landed>.poem-h .poem-btn{background:rgba(139,0,0,.16);}

    @media (max-width:760px){
      .poem-side{gap:.5rem;}
      .poem-leader,.poem-date{display:none;}
      .poem-in{padding-left:0;}
      .part-num{min-width:3.4rem;}
    }

    /* Without JavaScript every part and every poem simply stands open and the
       page is a plain, complete document — all ninety-nine texts, readable and
       crawlable. The class is removed by script the moment the vault is parsed. */
    .vault.nojs .part-body,.vault.nojs .poem-body{max-height:none;overflow:visible;}
    .vault.nojs .part-mark,.vault.nojs .poem-open,.vault.nojs .vault-tools{display:none;}
`;

const JS = `
  (function () {
    var vault = document.getElementById('vault');
    if (!vault) return;

    /* Measured height, never an fr. See rule 2 in build-vault.mjs. */
    function open(panel) {
      panel.style.maxHeight = panel.scrollHeight + 'px';
    }
    function shut(panel) {
      panel.style.maxHeight = panel.scrollHeight + 'px';
      void panel.offsetHeight;
      panel.style.maxHeight = '0px';
    }
    /* Once a panel finishes opening it is released, so a poem opening inside an
       already-open part can grow the part with it. */
    vault.addEventListener('transitionend', function (e) {
      if (e.propertyName !== 'max-height') return;
      var panel = e.target;
      if (!panel.classList || !/(part|poem)-body/.test(panel.className)) return;
      var box = panel.parentElement;
      if (box && box.classList.contains('open')) panel.style.maxHeight = 'none';
    });

    function grow(el) {
      var part = el.closest ? el.closest('.part') : null;
      if (part && part.classList.contains('open')) {
        var pb = part.querySelector(':scope > .part-body');
        if (pb && pb.style.maxHeight !== 'none') open(pb);
      }
    }

    /* The instant flag skips the animation entirely. Landing from a permalink used to
       animate the panel open and scroll 60ms later, which is a race the scroll
       always lost: the panel kept growing after the browser had already picked a
       position, and #045 ended up ~290px BELOW the fold on a 695px window. So a
       permalink opens its panels at full height first, then scrolls once, with
       nothing left in flight to move the target. */
    function toggle(box, panel, btn, want, instant) {
      var isOpen = box.classList.contains('open');
      var next = typeof want === 'boolean' ? want : !isOpen;
      if (next === isOpen) {
        if (next && instant) panel.style.maxHeight = 'none';
        return;
      }
      box.classList.toggle('open', next);
      btn.setAttribute('aria-expanded', String(next));
      if (next) {
        if (instant) panel.style.maxHeight = 'none';
        else { open(panel); grow(box); }
      } else { shut(panel); setTimeout(function () { grow(box); }, 0); }
    }

    vault.addEventListener('click', function (e) {
      var pb = e.target.closest('.part-btn');
      if (pb) {
        var part = pb.closest('.part');
        return toggle(part, part.querySelector(':scope > .part-body'), pb);
      }
      var mb = e.target.closest('.poem-btn');
      if (mb) {
        var poem = mb.closest('.poem');
        return toggle(poem, poem.querySelector(':scope > .poem-body'), mb);
      }
    });

    /* Deep link: atuona.xyz/#p045 opens PART, opens the poem, and lands on it —
       one URL instead of forty-four poems of scrolling. */
    function land(hash) {
      var m = /^#p(\\d{3})$/.exec(hash || '');
      if (!m) return false;
      var poem = document.getElementById('p' + m[1]);
      if (!poem) return false;
      var part = poem.closest('.part');
      if (part) toggle(part, part.querySelector(':scope > .part-body'), part.querySelector('.part-btn'), true, true);
      toggle(poem, poem.querySelector(':scope > .poem-body'), poem.querySelector('.poem-btn'), true, true);
      poem.classList.add('landed');
      setTimeout(function () { poem.classList.remove('landed'); }, 2200);
      // Panels are already at full height, so this position is final. The sticky
      // header is 160px tall and would otherwise cover the row it just found.
      var y = poem.getBoundingClientRect().top + window.pageYOffset - 170;
      window.scrollTo({ top: y < 0 ? 0 : y, behavior: 'auto' });
      return true;
    }
    window.addEventListener('hashchange', function () { land(location.hash); });

    /* Find. Rows are hidden, never removed — the text stays in the document for
       answer engines whatever the reader has typed. */
    var find = document.getElementById('vault-find');
    var tally = document.getElementById('vault-tally');
    var empty = document.getElementById('vault-empty');
    var rows = [].slice.call(vault.querySelectorAll('.poem'));
    var TOTAL = rows.length;

    if (find) {
      find.addEventListener('input', function () {
        var q = find.value.trim().toLowerCase();
        vault.classList.toggle('finding', q.length > 0);
        var hits = 0;
        rows.forEach(function (row) {
          var hit = !q || row.getAttribute('data-find').indexOf(q) !== -1;
          row.hidden = !hit;
          if (hit) hits++;
        });
        vault.querySelectorAll('.part').forEach(function (part) {
          var any = part.querySelector('.poem:not([hidden])');
          part.hidden = q ? !any : false;
          if (q && any) {
            toggle(part, part.querySelector(':scope > .part-body'), part.querySelector('.part-btn'), true);
          }
        });
        if (empty) empty.classList.toggle('on', hits === 0);
        if (tally) tally.textContent = q ? hits + ' of ' + TOTAL + ' ${UNIT.many}' : TOTAL + ' ${UNIT.many}';
        vault.querySelectorAll('.part.open > .part-body').forEach(function (p) {
          if (p.style.maxHeight !== 'none') open(p);
        });
      });
    }

    /* The vault is live: collapse it and honour any incoming permalink. */
    vault.classList.remove('nojs');
    if (!land(location.hash)) {
      var first = document.getElementById('part-atuona');
      if (first) toggle(first, first.querySelector(':scope > .part-body'), first.querySelector('.part-btn'), true);
    }
  })();
`;

const total = poems.length;
const tree = `${MARK_START}
    <!-- Generated by scripts/build-vault.mjs from content/poems.json — do not hand-edit. -->
    <style id="vault-css">${CSS}    </style>

    <div class="vault nojs" id="vault">
    <script>document.getElementById('vault').classList.remove('nojs');</script>

      <div class="vault-head">
        <div class="vault-kicker">Contents</div>
        <h3 class="vault-title">Gallery of ${UNIT.Many}</h3>
        <p class="vault-note">${total} ${UNIT.many}, in two parts. Each one opens where it stands — the full
          text is on this page whether it is open or shut. Type a number or a word to find one.</p>
        <div class="vault-tools">
          <input id="vault-find" class="vault-find" type="search" autocomplete="off" spellcheck="false"
            placeholder="find ${UNIT.article} ${UNIT.one} — 045, каблук, eternity…" aria-label="Find ${UNIT.article} ${UNIT.one} by number, title or line">
          <span id="vault-tally" class="vault-tally">${total} ${UNIT.many}</span>
        </div>
        <div id="vault-empty" class="vault-empty">No ${UNIT.one} matches that. Try a number — 001 to ${String(total).padStart(3, '0')}.</div>
      </div>

${PARTS.map(partBlock).join('\n')}

    </div>

    <script>${JS}    </script>
    ${MARK_END}`;

/* ── The mint must key off IDENTITY, not POSITION ────────────────────────────
   enhanceAllMintingButtons() rewrites the onclick of every card on load and
   derived the token id from the card's DOM index:

       const poemId = String(index + 1).padStart(3, '0');

   On the flat page that was right by luck — the cards happened to sit in order
   #001…#099 with no gaps, so index+1 equalled the card's own number. It also
   means the 99 hand-written onclicks in the HTML are decorative; this function
   overwrites all of them, including the 44 that carried none.

   Reorder anything and the drop silently mints the wrong token. This tree does
   reorder (ATUONA first, newest first), so the id now comes from the card's own
   .nft-id — which is what the hover handler 300 lines below already does.

   On the current corpus this is behaviour-identical (#NNN === index+1 for all
   99); under any future ordering it is simply correct. */
function patchRuntimeIds(src) {
  const OLD = `const poemId = String(index + 1).padStart(3, '0');`;
  const NEW = `const idEl = card.querySelector('.nft-id');
                    // Identity, not position: the card says which token it is.
                    const poemId = idEl ? idEl.textContent.trim().replace(/^#/, '')
                                        : String(index + 1).padStart(3, '0');`;
  if (src.includes(NEW)) return src;                 // already patched
  const hits = src.split(OLD).length - 1;
  if (hits !== 1) {
    throw new Error(`expected exactly 1 position-derived poemId, found ${hits} — refusing to guess at the mint path`);
  }
  return src.replace(OLD, NEW);
}

/* ── The hero button pointed at the container this tree replaced ─────────────
   "EXPLORE THE VOID" scrolled the reader to the poems with:

       const nftGrid = document.querySelector('.nft-grid');
       nftGrid.scrollIntoView(...);

   The flat grid is gone, so that query returns null and the click throws a
   TypeError on the line after the notification fires — the button lights up and
   does nothing. Caught by audit-against-baseline.mjs, which noticed the class
   `nft-grid` existed in the old page and in no element of the new one.

   Repointed at the vault, with the old grid kept as a fallback and a null guard
   so it degrades to doing nothing rather than throwing. */
function patchHeroScroll(src) {
  // Matched by regex, not by a literal: index.html is checked out with CRLF on
  // this machine, so a multi-line literal written with \n silently matches
  // nothing. That is the same class of bug as the publisher's whitespace splice.
  const OLD = /const nftGrid = document\.querySelector\('\.nft-grid'\);\s*\r?\n\s*nftGrid\.scrollIntoView\(\{ behavior: 'smooth', block: 'start' \}\);/;
  const NEW = `// The vault replaced the old flat .nft-grid container.
                    const nftGrid = document.querySelector('#vault, .vault, .nft-grid');
                    if (nftGrid) nftGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });`;
  if (src.includes(`document.querySelector('#vault, .vault, .nft-grid')`)) return src;
  const hits = (src.match(new RegExp(OLD.source, 'g')) || []).length;
  if (hits !== 1) {
    throw new Error(`expected exactly 1 hero scroll target, found ${hits} — refusing to guess at the hero button`);
  }
  return src.replace(OLD, NEW);
}

/* ── Splice ──────────────────────────────────────────────────────────────────
   First build replaces the original flat `.nft-grid`; every build after that
   replaces between the markers. Either way the region is fully generated, so
   the page can never drift from poems.json again. */
let html = readFileSync(HTML, 'utf8');
let before;

if (html.includes(MARK_START) && html.includes(MARK_END)) {
  const a = html.indexOf(MARK_START);
  const b = html.indexOf(MARK_END) + MARK_END.length;
  before = html.slice(a, b);
  html = html.slice(0, a) + tree + html.slice(b);
} else {
  const gridStart = html.indexOf('<div class="nft-grid">');
  if (gridStart < 0) throw new Error('no VAULT markers and no .nft-grid — refusing to guess where the vault goes');
  const aboutStart = html.indexOf('<section id="about"');
  if (aboutStart < 0 || aboutStart < gridStart) throw new Error('cannot bound the vault: #about not found after .nft-grid');
  // The grid closes with the last `</div>` before `</section>`.
  const homeEnd = html.lastIndexOf('</section>', aboutStart);
  const gridEnd = html.lastIndexOf('</div>', homeEnd) + '</div>'.length;
  if (gridEnd <= gridStart) throw new Error('cannot find the closing </div> of .nft-grid');
  before = html.slice(gridStart, gridEnd);
  html = html.slice(0, gridStart) + tree + html.slice(gridEnd);
}

html = patchRuntimeIds(html);
html = patchHeroScroll(html);

/* ── Proof, not hope ─────────────────────────────────────────────────────────
   This is an NFT drop. Every claim button that was in the old region must be in
   the new one, character for character, or the build refuses. */
const buttons = (s) => (s.match(/<button class="nft-action"[\s\S]*?<\/button>/g) || [])
  .map((b) => b.replace(/\s+/g, ' ').trim()).sort();
const wasBtn = buttons(before);
const nowBtn = buttons(tree);
if (wasBtn.length !== nowBtn.length || wasBtn.some((b, i) => b !== nowBtn[i])) {
  throw new Error(`claim buttons changed: ${wasBtn.length} before, ${nowBtn.length} after — refusing to touch the drop`);
}

/* The bag being equal is NOT enough, and believing it was is how the first cut
   of this script shipped poem #045 wired to token 081. Each poem's own card must
   carry its own number and its own button — check the PAIRING, not the multiset. */
const mispaired = [];
for (const p of poems) {
  const a = tree.indexOf(`id="p${p.id}"`);
  const b = tree.indexOf('</article>', a);
  if (a < 0 || b < 0) { mispaired.push(`#${p.id} article not found`); continue; }
  const card = tree.slice(a, b);
  if (!card.includes(`<div class="nft-id">#${p.id}</div>`)) mispaired.push(`#${p.id} card carries the wrong number`);
  if (!card.includes(p.buttonHtml)) mispaired.push(`#${p.id} has another poem's claim button`);
  if (!card.includes(p.verseHtml)) mispaired.push(`#${p.id} has another poem's verse`);
}
if (mispaired.length) {
  throw new Error(`refusing to write — ${mispaired.length} mispairing(s):\n  ` + mispaired.slice(0, 15).join('\n  '));
}

/* Nothing lost: no poem, no format, no style. Every stored field of every poem
   has to appear in the built region CHARACTER FOR CHARACTER, or the build stops
   and index.html is never written. A silent drop is the one outcome this whole
   refactor exists to make impossible. */
const FIELDS = ['titleHtml', 'verseHtml', 'badgeHtml', 'descriptionHtml', 'buttonHtml'];
const losses = [];
for (const p of poems) {
  if (!tree.includes(`id="p${p.id}"`)) { losses.push(`#${p.id} row missing entirely`); continue; }
  for (const f of FIELDS) {
    if (p[f] && !tree.includes(p[f])) losses.push(`#${p.id} ${f} not carried verbatim`);
  }
  if (p.price && !tree.includes(`>${esc(p.price)}<`)) losses.push(`#${p.id} price lost`);
  if (p.note && !tree.includes(esc(p.note))) losses.push(`#${p.id} note lost`);
  // The card chrome, not just the text: status chip and id badge must survive.
  if (!tree.includes(`<div class="nft-status ${p.statusClass}">${esc(p.status)}</div>`)) {
    losses.push(`#${p.id} status chip lost`);
  }
}
if (losses.length) {
  throw new Error(`refusing to write — ${losses.length} loss(es):\n  ` + losses.slice(0, 20).join('\n  '));
}

/* And the same check from the other direction: every class the old region used
   for styling must still be used by the new one, or the poems would render
   unstyled even though the text survived. */
const CLASSES = ['nft-card', 'nft-header', 'nft-id', 'nft-status', 'nft-content',
                 'nft-title', 'nft-verse', 'blockchain-badge', 'nft-description',
                 'nft-meta', 'nft-price', 'nft-action'];
const dropped = CLASSES.filter((c) => before.includes(`class="${c}`) && !tree.includes(`class="${c}`));
if (dropped.length) throw new Error(`styling classes dropped: ${dropped.join(', ')}`);

if (CHECK) {
  console.log(`build-vault --check: ${total} poems, ${nowBtn.length} claim buttons preserved. Nothing written.`);
} else {
  writeFileSync(HTML, html, 'utf8');
  console.log(`build-vault: ${total} poems in ${PARTS.length} parts → index.html`);
  PARTS.forEach((p) => {
    const n = poems.filter((x) => x.venue === p.venue).length;
    console.log(`  ${p.num.padEnd(8)} ${p.title.padEnd(9)} ${unitCount(n)}`);
  });
  console.log(`  claim buttons preserved: ${nowBtn.length} (${poems.filter((p) => p.mints).length} carry an onclick)`);
}
