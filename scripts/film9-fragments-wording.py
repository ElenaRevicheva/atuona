"""11 Oct 2026: the ATUONA film sheet speaks of FRAGMENTS (Elena: "i have fragments in atuona.xyz, not poems") and describes
the v10 text (the stanzas typed as a PowerShell session). Other films' sheets keep their wording. Rebuilds the sheets.
Usage (atuona repo root): python scripts/film9-fragments-wording.py"""
import subprocess

def edit(path, pairs):
    s = open(path, encoding='utf-8', newline='').read()
    crlf = '\r\n' in s
    for a, b in pairs:
        if crlf:
            a, b = a.replace('\r\n', '\n').replace('\n', '\r\n'), b.replace('\r\n', '\n').replace('\n', '\r\n')
        assert s.count(a) == 1, f'{path}: {a[:80]}'
        s = s.replace(a, b)
    open(path, 'w', encoding='utf-8', newline='').write(s)

edit('scripts/build-film-sheets.mjs', [
    # ATUONA entry (the first, JSON-shaped)
    ('    "slug": "atuona",', '    "slug": "atuona",\n    "poemsHeading": "Fragments in the film",'),
    ('        "Poems, direction, edit",\n        "Kira Velerevich (Elena Revicheva)"',
     '        "Fragments, direction, edit",\n        "Kira Velerevich (Elena Revicheva)"'),
    ('"Every stanza whole, in the poet’s words, set in Syne and arriving with the voice; a glitch that tears across every shot"',
     '"Every stanza whole, in the poet’s words, typed into a PowerShell session with the voice (Get-Content .\\\\fragments\\\\NNN.txt, the number of the fragment it comes from); a glitch that tears across every shot"'),
    # template: the heading per film; the note for an all-ATUONA film says fragment
    ('<section><h2>Poems in the film</h2>', '<section><h2>${esc(f.poemsHeading || \'Poems in the film\')}</h2>'),
    ("Each poem opens in the vault.", "Each fragment opens in the vault."),
])
subprocess.run(['node', 'scripts/build-film-sheets.mjs'], check=True)
edit('public/llms.txt', [('synopsis, poems linked to the vault, credits', 'synopsis, fragments linked to the vault, credits')])
print('fragments wording applied')
