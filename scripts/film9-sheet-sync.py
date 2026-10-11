"""11 Oct 2026: keep the Arearea film sheet in step with the published cut - its running time and its fragment list are rebuilt
from the cut's own poem_links (the fragments the film actually quotes, in film order), so the page and the film never disagree.
Usage (atuona repo root): python scripts/film9-sheet-sync.py <cto-aipa cut json> <seconds>"""
import json, re, subprocess, sys
CUT, SECS = sys.argv[1], int(round(float(sys.argv[2])))
cut = json.load(open(CUT, encoding='utf-8'))
p = 'scripts/build-film-sheets.mjs'
s = open(p, encoding='utf-8', newline='').read()
i = s.index('"slug": "arearea"')
j = s.index('"credits":', i)
block = s[i:j]
poems = json.dumps([[f"#{l['num']}", l['title'], 'ATUONA'] for l in cut['poem_links']], ensure_ascii=False, indent=2)
poems = poems.replace('\n', '\n    ')
block2 = re.sub(r'"seconds": \d+', f'"seconds": {SECS}', block, count=1)
block2 = re.sub(r'"poems": \[[\s\S]*?\n    \],', f'"poems": {poems},', block2, count=1)
assert block2 != block or f'"seconds": {SECS}' in block
s = s[:i] + block2 + s[j:]
open(p, 'w', encoding='utf-8', newline='').write(s)
subprocess.run(['node', 'scripts/build-film-sheets.mjs'], check=True)
mmss = f'{SECS // 60}:{SECS % 60:02d}'
t = open('public/llms.txt', encoding='utf-8', newline='').read()
t = re.sub(r'Film sheet: Arearea \(2026, \d+:\d\d\)', f'Film sheet: Arearea (2026, {mmss})', t)
open('public/llms.txt', 'w', encoding='utf-8', newline='').write(t)
print('sheet synced:', mmss, len(cut['poem_links']), 'fragments')
