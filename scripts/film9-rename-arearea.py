"""11 Oct 2026: film #9 is renamed ATUONA -> "Arearea" (Elena: "name the movie Arerea, not Atuona"; the painting's spelling).
  - film sheet moves to /aifilmstudio/arearea/ (title Arearea, the new published file, running time), stills/poster carried over
  - /aifilmstudio/atuona/ becomes a redirect page to the new address (links already shared keep working)
  - studio list (SHEETS map, noscript, ItemList), llms.txt and sitemap point at the new name, file and page
Usage (atuona repo root): python scripts/film9-rename-arearea.py <new published file name> <seconds>"""
import json, re, subprocess, sys, shutil, os
NEW_FILE, SECS = sys.argv[1], int(round(float(sys.argv[2])))
OLD_FILE = 'atuona-2026-10-10T23-24-23.mp4'
BASE = 'https://webhook.aideazz.xyz/cto/films/'
mmss = f'{SECS // 60}:{SECS % 60:02d}'

def edit(path, pairs, count=1):
    s = open(path, encoding='utf-8', newline='').read()
    crlf = '\r\n' in s
    for a, b in pairs:
        if crlf: a, b = a.replace('\r\n', '\n').replace('\n', '\r\n'), b.replace('\r\n', '\n').replace('\n', '\r\n')
        n = s.count(a); assert n >= 1, f'{path}: not found: {a[:80]}'
        s = s.replace(a, b) if count == 0 else s.replace(a, b, count)
    open(path, 'w', encoding='utf-8', newline='').write(s)

# 1. the sheet entry: slug, title, file, seconds
edit('scripts/build-film-sheets.mjs', [
    ('    "slug": "atuona",', '    "slug": "arearea",'),
    ('    "title": "ATUONA",', '    "title": "Arearea",'),
    (f'    "file": "{OLD_FILE}",', f'    "file": "{NEW_FILE}",'),
])
s = open('scripts/build-film-sheets.mjs', encoding='utf-8').read()
s = re.sub(r'("slug": "arearea",[\s\S]*?"seconds": )\d+', lambda m: m.group(1) + str(SECS), s, count=1)
open('scripts/build-film-sheets.mjs', 'w', encoding='utf-8', newline='').write(s)
os.makedirs('public/aifilmstudio/arearea', exist_ok=True)
shutil.copy('public/aifilmstudio/atuona/still-1.jpg', 'public/aifilmstudio/arearea/still-1.jpg')
subprocess.run(['node', 'scripts/build-film-sheets.mjs'], check=True)
# 2. the old address redirects
open('public/aifilmstudio/atuona/index.html', 'w', encoding='utf-8').write(
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Arearea · ATUONA AI Film Studio</title>'
    '<link rel="canonical" href="https://atuona.xyz/aifilmstudio/arearea/">'
    '<meta http-equiv="refresh" content="0; url=/aifilmstudio/arearea/"><meta name="robots" content="noindex">'
    '</head><body style="background:#070708;color:#ededed;font-family:sans-serif">'
    '<p>Film #9 is now called <a href="/aifilmstudio/arearea/" style="color:#e0144c">Arearea</a>.</p></body></html>\n')
if os.path.exists('public/aifilmstudio/atuona/still-1.jpg'):
    pass   # kept: the redirect page's old poster stays reachable for previews already cached
# 3. studio list
p = 'public/aifilmstudio/index.html'
edit(p, [(f"'{OLD_FILE}':'/aifilmstudio/atuona/'", f"'{NEW_FILE}':'/aifilmstudio/arearea/'"),
         (f'<a href="{BASE}{OLD_FILE}">ATUONA</a>', f'<a href="{BASE}{NEW_FILE}">Arearea</a>'),
         ('<a href="/aifilmstudio/atuona/">film sheet</a>', '<a href="/aifilmstudio/arearea/">film sheet</a>')])
s = open(p, encoding='utf-8', newline='').read()
m = re.search(r'(<script type="application/ld\+json">)(.*?)(</script>)', s, re.S)
d = json.loads(m.group(2))
for g in d['@graph']:
    for x in (g.get('itemListElement') or (g.get('mainEntity') or {}).get('itemListElement') or []):
        it = x['item']
        if it.get('contentUrl') == BASE + OLD_FILE:
            it.update({'name': 'Arearea', 'contentUrl': BASE + NEW_FILE, 'thumbnailUrl': 'https://atuona.xyz/aifilmstudio/arearea/still-1.jpg',
                       'description': 'Arearea — a short film from the ATUONA AI Film Studio by Elena Revicheva, released 2026-10-10.'})
s = s[:m.start(2)] + json.dumps(d, ensure_ascii=False) + s[m.end(2):]
open(p, 'w', encoding='utf-8', newline='').write(s)
# 4. llms.txt + sitemap
s = open('public/llms.txt', encoding='utf-8', newline='').read()
s = re.sub(r'- \[Film sheet: ATUONA \(2026, \d+:\d\d\)', f'- [Film sheet: Arearea (2026, {mmss})', s)
s = s.replace('(https://atuona.xyz/aifilmstudio/atuona/)', '(https://atuona.xyz/aifilmstudio/arearea/)')
s = s.replace(f'- [ATUONA]({BASE}{OLD_FILE})', f'- [Arearea]({BASE}{NEW_FILE})')
open('public/llms.txt', 'w', encoding='utf-8', newline='').write(s)
edit('public/sitemap.xml', [('<loc>https://atuona.xyz/aifilmstudio/atuona/</loc><lastmod>2026-10-10</lastmod>',
                             '<loc>https://atuona.xyz/aifilmstudio/arearea/</loc><lastmod>2026-10-11</lastmod>')])
print('renamed to Arearea:', NEW_FILE, mmss)
