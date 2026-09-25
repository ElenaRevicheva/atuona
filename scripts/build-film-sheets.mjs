#!/usr/bin/env node
/**
 * build-film-sheets.mjs — one-screen press sheets for curators and festivals.
 *
 * Writes public/aifilmstudio/<slug>/index.html for every film in FILMS. Every fact here comes
 * from the film's own record in cto-aipa (docs/atuona/FILM7_PARADISE_IS_COMPILED.md,
 * docs/atuona/FILM8_2026-09-22.md) and the published file itself (ffprobe duration). Stills are
 * frames of the published film, chosen by hand: implied, never explicit.
 *
 * Authorship line, on purpose: the poems, the direction and the edit are the artist's; AI renders
 * the image, the motion and the voice. Keep the credits saying exactly that.
 *
 * Usage: node scripts/build-film-sheets.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const SITE = 'https://atuona.xyz';
const FILMS_BASE = 'https://webhook.aideazz.xyz/cto/films/';

const FILMS = [
  {
    slug: 'crimson-escape',
    title: 'Crimson Escape',
    file: 'crimson-escape-2026-09-22T16-32-00.mp4',
    seconds: 216,
    released: '2026-09-22',
    number: 8,
    logline: 'An island that eats its guests, a crimson room at 3 AM, and one line that will not be bleached.',
    synopsis: [
      'Kira lands on Hiva Oa, an island that does not accept guests. It eats them. At 3 AM, in a crimson room, she becomes Manet’s Olympia, staring straight back the way her code stares at her.',
      'She sinks through a velvet looking-glass, crosses a checkerboard from pawn to queen, and faces herself in a dungeon mirror. The film ends where Gauguin carved insults into wood, on black volcanic sand the Pacific keeps trying to bleach: “I will not whiten.”',
    ],
    poems: [
      ['#092', 'Hungry Earth', 'ATUONA'],
      ['#071', 'Crimson Escape', 'ATUONA'],
      ['#007', 'To Dad (Папе)', 'LITPROM'],
      ['#039', 'Beyond the Wall (Когда застенье)', 'LITPROM'],
      ['#095', 'The Secret Exhibition', 'ATUONA'],
    ],
    credits: [
      ['Poems, direction, edit', 'Kira Velerevich (Elena Revicheva)'],
      ['Characters', 'Kira, and Ule, a Norwegian collector'],
      ['Image', 'Flux 2 Max keyframes, from two character reference portraits'],
      ['Motion', 'Wan 2.7 (close shots) · Grok Imagine Video 1.5 (wide shots)'],
      ['Voices', 'OpenAI gpt-4o-mini-tts, directed per line'],
      ['Music', '“The Ritual” — Saturn-3-Music (Pixabay)'],
    ],
    specs: '16 shots · English · 16:9 · stereo · HD master available',
    stills: [
      'The jet drops into the airstrip cut into Hiva Oa. “Hiva Oa doesn’t accept guests. It eats them.”',
      'Olympia, after Manet: the hibiscus, the black ribbon, the stare.',
      'The carved doorframe of the Maison du Jouir, by torchlight.',
    ],
  },
  {
    slug: 'could-not-generate-content',
    title: 'Could not generate content.',
    file: 'could-not-generate-content-2026-09-22T10-50-15.mp4',
    seconds: 188,
    released: '2026-09-22',
    number: 7,
    logline: 'The machine refuses. The film begins inside the refusal.',
    synopsis: [
      'A man sits at a monitor that says: Could not generate content. The title is the first shot, and the poem it comes from kept that refusal as its name.',
      'A woman writhes in a torn net in a riverbed, runs up a stairwell skipping every floor, shakes smoky incense out of feathers at dawn, and waits alone against a rusted tunnel wall in the smoke of a Sobranie. It ends on a girl with a laptop at night, “in a hotel on an island where a man died looking for paradise.”',
    ],
    poems: [
      ['#099', 'Could not generate content.', 'ATUONA'],
      ['#015', 'Frozen (Застывшее)', 'LITPROM'],
      ['#024', 'Burned Out (Сгоревший)', 'LITPROM'],
      ['#037', 'From the Hurt (От обиды)', 'LITPROM'],
      ['#022', 'Wild Tales Curl (Вьются шальные повести)', 'LITPROM'],
      ['#020', 'Nobody’s (Ничья)', 'LITPROM'],
      ['#066', 'The Threshold', 'ATUONA'],
      ['#091', 'Code and Canvas', 'ATUONA'],
    ],
    credits: [
      ['Poems, direction, edit', 'Kira Velerevich (Elena Revicheva)'],
      ['Material', '19 video renders and 20 stills from the artist’s own sessions, all used, nothing added'],
      ['Image', 'Flux 2 Pro stills'],
      ['Motion', 'Luma, Kling, Veo, Seedance · stills set in motion with a depth-based 2.5D camera (Depth Anything V2)'],
      ['Voice', 'OpenAI tts-1'],
      ['Music', '“Red Lips (Sensual Noir Lo-Fi Beat)” — WBM Studio (Pixabay)'],
    ],
    specs: 'English · 16:9 · stereo · HD master available',
    stills: [
      'The first shot, and the title: the machine’s refusal on the screen.',
      '“As if everyone, waking at dawn, were shaking smoky incense out of their feathers.”',
      '“Soon we’ll be over again, and there’s no way back in the deep pool of loneliness …”',
    ],
  },
];

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
const iso = (s) => `PT${Math.floor(s / 60)}M${s % 60}S`;

function page(f) {
  const url = `${SITE}/aifilmstudio/${f.slug}/`;
  const video = FILMS_BASE + f.file;
  const year = f.released.slice(0, 4);
  const desc = `${f.title} (${year}, ${mmss(f.seconds)}) — a poem-film by Kira Velerevich from the ATUONA AI Film Studio. ${f.logline}`;
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    '@id': `${url}#film`,
    name: f.title,
    url,
    description: f.synopsis.join(' '),
    duration: iso(f.seconds),
    dateCreated: f.released,
    inLanguage: 'en',
    genre: ['Poetry film', 'Experimental', 'AI cinema'],
    image: [1, 2, 3].map((i) => `${url}still-${i}.jpg`),
    director: { '@type': 'Person', name: 'Kira Velerevich', alternateName: 'Elena Revicheva', url: `${SITE}/` },
    author: { '@type': 'Person', name: 'Kira Velerevich', alternateName: 'Elena Revicheva' },
    productionCompany: { '@type': 'Organization', name: 'ATUONA AI Film Studio', url: `${SITE}/aifilmstudio/` },
    trailer: { '@type': 'VideoObject', name: f.title, contentUrl: video, thumbnailUrl: `${url}still-1.jpg`, uploadDate: f.released, duration: iso(f.seconds) },
  };
  const poems = f.poems
    .map(([n, t, ch]) => `<li><span class="n">${esc(n)}</span> ${esc(t)} <span class="ch">${esc(ch)}</span></li>`)
    .join('');
  const credits = f.credits.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('');
  const stills = f.stills
    .map((cap, i) => `<figure><img src="still-${i + 1}.jpg" alt="${esc(cap)}" loading="lazy" width="1280" height="720"><figcaption>${esc(cap)}</figcaption></figure>`)
    .join('');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(f.title)} · ATUONA AI Film Studio</title>
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="video.movie">
<meta property="og:site_name" content="ATUONA">
<meta property="og:title" content="${esc(f.title)} — a poem-film by Kira Velerevich">
<meta property="og:description" content="${esc(f.logline)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${url}still-1.jpg">
<meta property="og:video" content="${video}">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<style>
  :root{--red:#e0144c;--bg:#070708;--ink:#ededed;--muted:#8a8a90}
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--ink);font-family:-apple-system,'Segoe UI',Roboto,sans-serif}
  header{padding:22px 18px;text-align:center;border-bottom:1px solid #1a1a1e;position:relative}
  .brand{font-weight:300;font-size:22px;letter-spacing:.35em;color:#eee;text-decoration:none}
  .tag{color:#eee;font-size:11px;letter-spacing:.4em;margin-top:8px;font-family:'Courier New',monospace;text-transform:uppercase}
  .back{position:absolute;left:18px;top:26px;color:var(--muted);text-decoration:none;font-size:12px;letter-spacing:.2em}
  .back:hover,a:hover{color:var(--red)}
  .wrap{max-width:980px;margin:0 auto;padding:22px 16px 48px}
  h1{font-family:Georgia,'Times New Roman',serif;font-weight:400;font-size:34px;margin:0 0 6px;color:#fff;letter-spacing:.01em}
  .meta{font-family:'Courier New',monospace;color:var(--muted);font-size:12px;letter-spacing:.14em;text-transform:uppercase;margin-bottom:14px}
  .log{font-family:Georgia,serif;font-style:italic;color:#cfcfd4;font-size:17px;margin:0 0 16px}
  video{width:100%;border-radius:6px;background:#000;display:block}
  .grid{display:grid;grid-template-columns:1.25fr 1fr;gap:26px;margin-top:22px}
  .syn p{font-family:Georgia,serif;font-size:16px;line-height:1.6;margin:0 0 12px;color:#e4e4e8}
  h2{font-family:'Courier New',monospace;font-weight:400;font-size:11px;letter-spacing:.35em;text-transform:uppercase;color:var(--muted);margin:0 0 10px}
  ul{list-style:none;padding:0;margin:0 0 18px}
  li{font-family:Georgia,serif;font-size:15px;padding:3px 0;border-bottom:1px solid #141418}
  .n{font-family:'Courier New',monospace;color:var(--red);font-size:12px;margin-right:6px}
  .ch{font-family:'Courier New',monospace;color:var(--muted);font-size:10px;letter-spacing:.2em;float:right;margin-top:4px}
  dl{margin:0;font-size:13px;line-height:1.5}
  dt{font-family:'Courier New',monospace;color:var(--muted);font-size:10px;letter-spacing:.2em;text-transform:uppercase;margin-top:8px}
  dd{margin:0;color:#e4e4e8}
  .stills{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:22px}
  figure{margin:0}img{width:100%;height:auto;border-radius:4px;display:block}
  figcaption{font-size:11px;color:var(--muted);margin-top:5px;line-height:1.4}
  .links{margin-top:20px;font-size:13px;letter-spacing:.06em}
  .links a{color:var(--red);text-decoration:none;margin-right:18px}
  footer{text-align:center;color:var(--muted);font-size:11px;letter-spacing:.08em;line-height:2;padding:26px 16px 40px;border-top:1px solid #16161a}
  footer a{color:#9a9aa0;text-decoration:none}
  .grid>*{min-width:0}body{overflow-wrap:anywhere}
  @media(max-width:760px){.grid{grid-template-columns:1fr}.stills{grid-template-columns:1fr}h1{font-size:28px}}
</style>
</head>
<body>
<header>
  <a class="back" href="/aifilmstudio/">&larr; FILMS</a>
  <a class="brand" href="/">ATUONA</a>
  <div class="tag">AI Film Studio &middot; Film sheet</div>
</header>
<main class="wrap">
  <h1>${esc(f.title)}</h1>
  <div class="meta">Film #${f.number} &middot; ${mmss(f.seconds)} &middot; ${year} &middot; ${esc(f.specs)}</div>
  <p class="log">${esc(f.logline)}</p>
  <video controls preload="metadata" playsinline poster="still-1.jpg" src="${esc(video)}"></video>
  <div class="grid">
    <section class="syn"><h2>Synopsis</h2>${f.synopsis.map((p) => `<p>${esc(p)}</p>`).join('')}
      <p style="font-size:14px;color:var(--muted)">Adult in mood, never explicit. On screen and in the voice: English. The LITPROM poems exist only in Russian and were translated line for line for the film.</p>
    </section>
    <section><h2>Poems in the film</h2><ul>${poems}</ul><h2>Credits</h2><dl>${credits}</dl></section>
  </div>
  <div class="stills">${stills}</div>
  <div class="links"><a href="${esc(video)}">Watch the film</a><a href="/">The vault: 99 fragments</a><a href="https://aideazz.xyz/portfolio">Artist portfolio</a></div>
</main>
<footer>ATUONA AI Film Studio &middot; <a href="https://atuona.xyz">atuona.xyz</a> &middot; A project of <strong>AIdeazz</strong> AI Lab &middot; <a href="https://aideazz.xyz/portfolio">aideazz.xyz/portfolio</a><br>Screenings, festivals, press: Kira Velerevich (Elena Revicheva) &middot; &copy; ${year}</footer>
</body>
</html>
`;
}

for (const f of FILMS) {
  const out = path.join(ROOT, 'public', 'aifilmstudio', f.slug, 'index.html');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, page(f), 'utf8');
  console.log('wrote', path.relative(ROOT, out));
}
