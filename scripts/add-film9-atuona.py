"""10 Oct 2026: add film #9 'ATUONA' to the AI Film Studio (Elena: "Publish the film in highest quality in my film studio").
Same shape as the film #8 commits (7fdb5835 + 1bff8597): film sheet at /aifilmstudio/atuona/ (poems as links into the vault),
the studio list (SHEETS map, noscript, ItemList JSON-LD), counts eight -> nine, llms.txt, sitemap.
Every poem on every film sheet now links to its permalink in the vault (atuona.xyz/#pNNN opens it).
Usage (atuona repo root): python scripts/add-film9-atuona.py <published file name> <seconds> <cto-aipa cut_v7 json> <final.mp4>"""
import json, re, subprocess, sys, os
FILE, SECS, CUT, MASTER = sys.argv[1], int(round(float(sys.argv[2]))), sys.argv[3], sys.argv[4]
FB = 'C:/Users/kirav/AppData/Local/Python/pythoncore-3.14-64/Lib/site-packages/static_ffmpeg/bin/win32'
VIDEO = 'https://webhook.aideazz.xyz/cto/films/' + FILE
cut = json.load(open(CUT, encoding='utf-8'))
poems = [[f"#{l['num']}", l['title'], 'ATUONA'] for l in cut['poem_links']]

def edit(path, pairs, count=1):
    s = open(path, encoding='utf-8', newline='').read()
    crlf = '\r\n' in s   # the repo checks files out with CRLF on this laptop: match and insert in the file's own line ending
    for a, b in pairs:
        if crlf:
            a, b = a.replace('\r\n', '\n').replace('\n', '\r\n'), b.replace('\r\n', '\n').replace('\n', '\r\n')
        n = s.count(a)
        assert n >= 1, f'{path}: not found: {a[:70]}'
        s = s.replace(a, b) if count == 0 else s.replace(a, b, count)
    open(path, 'w', encoding='utf-8', newline='').write(s)

# 1. film sheet entry + poems as links + the LITPROM note only where LITPROM is quoted
entry = {
    'slug': 'atuona', 'title': 'ATUONA', 'file': FILE, 'seconds': SECS, 'released': '2026-10-10', 'number': 9,
    'logline': 'A woman who will not whiten, a witness who is not a lover, and an island that sells everything, even a tear, by the lot.',
    'synopsis': [
        'Kira and Ule stand apart before a bare gallery wall where Paradise should hang. She kisses the frost on a window, floats on black water and goes under, wakes, and finds her reflection living a different hour in the mirror.',
        'On the jetty Jean-Marc Dupont walks in with Mila, the face of a Saint Laurent campaign, his palm on her waist like a lot with a pre-sale estimate. A storm, an emerald clasp, a cage built for two, a tear that falls and becomes an auction lot. Salt on Ule\u2019s skin like maps of countries that don\u2019t exist. Not a lover. A witness. It ends on black volcanic sand: \u201cI will not whiten.\u201d',
    ],
    'poems': poems,
    'credits': [
        ['Poems, direction, edit', 'Kira Velerevich (Elena Revicheva)'],
        ['Characters', 'Kira; Ule, a Norwegian collector; Mila and Jean-Marc'],
        ['Image', 'Keyframes from the cast\u2019s reference portraits: Seedream v5 Pro, GPT Image, Nano Banana Pro, Grok Imagine (Venice)'],
        ['Motion', 'Kling O3 Pro (Venice) \u00b7 one shot by Luma'],
        ['Voice', 'OpenAI tts-1 (onyx), the studio\u2019s narrator'],
        ['Music', '\u201cBasement\u201d \u2014 an original track generated for the film with ElevenLabs Music'],
        ['Text and glitch', 'Every stanza whole, in the poet\u2019s words, set in Syne and arriving with the voice; a glitch that tears across every shot'],
    ],
    'specs': '23 shots \u00b7 English \u00b7 16:9 \u00b7 stereo \u00b7 1080p master',
    'stills': [
        'Before a bare gallery wall: \u201cWhat about the painting?\u201d she asked. \u201cParadise?\u201d',
        'Mila on the window seat: \u201cI remember Modigliani\u2019s line: When I know your soul, I will paint your eyes.\u201d',
        '\u201cUle wiped his face. Salt left white trails on his skin \u2014 like maps of countries that don\u2019t exist.\u201d',
    ],
}
js = 'const FILMS = [\n  ' + json.dumps(entry, ensure_ascii=False, indent=2).replace('\n', '\n  ') + ',\n'
edit('scripts/build-film-sheets.mjs', [
    ('const FILMS = [\n', js),
    ('.map(([n, t, ch]) => `<li><span class="n">${esc(n)}</span> ${esc(t)} <span class="ch">${esc(ch)}</span></li>`)',
     '.map(([n, t, ch]) => `<li><a class="pl" href="/#p${esc(n.replace(\'#\', \'\'))}"><span class="n">${esc(n)}</span> ${esc(t)}</a> <span class="ch">${esc(ch)}</span></li>`)'),
    ('  .n{font-family', '  .pl{color:inherit;text-decoration:none}.pl:hover{color:var(--red)}\n  .n{font-family'),
    ('      <p style="font-size:14px;color:var(--muted)">Adult in mood, never explicit. On screen and in the voice: English. The LITPROM poems exist only in Russian and were translated line for line for the film.</p>',
     '      <p style="font-size:14px;color:var(--muted)">Adult in mood, never explicit. On screen and in the voice: English.${f.poems.some((p) => p[2] === \'LITPROM\') ? \' The LITPROM poems exist only in Russian and were translated line for line for the film.\' : \' Every stanza is the poet\\u2019s own English, unchanged. Each poem opens in the vault.\'}</p>'),
])
subprocess.run(['node', 'scripts/build-film-sheets.mjs'], check=True)

# 2. three stills from the published master (implied, never explicit), at the middle of shots 1a, M5, 25
tl = json.load(open(os.path.join(os.path.dirname(MASTER), 'timeline.json'), encoding='utf-8'))
at = {t['shot']: t['start'] + t['dur'] * 0.72 for t in tl}
for k, sid in enumerate(['1a', 'M5', '25'], 1):
    subprocess.run([f'{FB}/ffmpeg.exe', '-v', 'error', '-y', '-ss', f'{at[sid]:.2f}', '-i', MASTER, '-frames:v', '1', '-vf', 'scale=1280:720',
                    '-q:v', '3', f'public/aifilmstudio/atuona/still-{k}.jpg'], check=True)

# 3. studio list: SHEETS, noscript, ItemList, nine films
item = {"@type": "ListItem", "position": 1, "item": {"@type": "VideoObject", "position": 1, "name": "ATUONA", "uploadDate": "2026-10-10",
        "contentUrl": VIDEO, "thumbnailUrl": "https://atuona.xyz/aifilmstudio/atuona/still-1.jpg", "encodingFormat": "video/mp4",
        "description": "ATUONA \u2014 a short film from the ATUONA AI Film Studio by Elena Revicheva, released 2026-10-10.",
        "creator": {"@id": "https://atuona.xyz/#elena"}, "inLanguage": "en"}}
p = 'public/aifilmstudio/index.html'
s = open(p, encoding='utf-8', newline='').read()
m = re.search(r'(<script type="application/ld\+json">)(.*?)(</script>)', s, re.S)
d = json.loads(m.group(2))
for g in d['@graph']:
    lst = g.get('itemListElement') or (g.get('mainEntity') or {}).get('itemListElement')
    if lst is not None:
        for x in lst:
            x['position'] += 1; x['item']['position'] += 1
        lst.insert(0, item)
        if 'numberOfItems' in g: g['numberOfItems'] = len(lst)
        if isinstance(g.get('mainEntity'), dict) and 'numberOfItems' in g['mainEntity']: g['mainEntity']['numberOfItems'] = len(lst)
s = s[:m.start(2)] + json.dumps(d, ensure_ascii=False) + s[m.end(2):]
open(p, 'w', encoding='utf-8', newline='').write(s)
edit(p, [
    ("var SHEETS={", "var SHEETS={'" + FILE + "':'/aifilmstudio/atuona/',"),
    ('<h2>Films from the ATUONA AI Film Studio</h2><ul>', '<h2>Films from the ATUONA AI Film Studio</h2><ul><li><a href="' + VIDEO + '">ATUONA</a> \u2014 released <time datetime="2026-10-10">2026-10-10</time> \u00b7 <a href="/aifilmstudio/atuona/">film sheet</a></li>'),
])
edit(p, [('Eight short films', 'Nine short films'), ('eight finished AI films', 'nine finished AI films'), ('Eight finished short films', 'Nine finished short films')], count=0)
edit('index.html', [('eight short films made with AI', 'nine short films made with AI'), ('eight finished short films', 'nine finished short films')], count=0)
edit('public/llms.txt', [
    ('eight finished short films', 'nine finished short films'),
    ('[AI Film Studio \u2014 eight finished films', '[AI Film Studio \u2014 nine finished films'),
    ('- [Film sheet: Crimson Escape', f'- [Film sheet: ATUONA (2026, {SECS // 60}:{SECS % 60:02d}) \u2014 synopsis, poems linked to the vault, credits, stills](https://atuona.xyz/aifilmstudio/atuona/)\n- [Film sheet: Crimson Escape'),
    ('- [Crimson Escape](https://webhook', f'- [ATUONA]({VIDEO}) \u2014 released 2026-10-10\n- [Crimson Escape](https://webhook'),
])
edit('public/sitemap.xml', [('  <url><loc>https://atuona.xyz/aifilmstudio/crimson-escape/</loc>',
     '  <url><loc>https://atuona.xyz/aifilmstudio/atuona/</loc><lastmod>2026-10-10</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n  <url><loc>https://atuona.xyz/aifilmstudio/crimson-escape/</loc>')])
print('film #9 added:', FILE, SECS, 's,', len(poems), 'poems linked')
