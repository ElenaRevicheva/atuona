/**
 * films.mjs — read the film records that build-film-sheets.mjs already holds.
 *
 * ONE source of truth. The FILMS list in build-film-sheets.mjs is the published
 * record of every film sheet (which fragments each film quotes, and the English
 * titles the sheets give to Russian fragments). The vault and the studio list
 * read it from there instead of keeping a second copy that could drift.
 *
 * Why read the source text instead of importing it: build-film-sheets.mjs WRITES
 * the sheets when it is loaded, and the film9-*.py scripts patch the FILMS
 * literal in place. Importing would rewrite files as a side effect; moving the
 * list would break those patchers. So we lift the literal out and evaluate it,
 * and refuse loudly if its shape ever changes.
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SRC = join(ROOT, 'scripts', 'build-film-sheets.mjs');

export function loadFilms() {
  const s = readFileSync(SRC, 'utf8');
  const a = s.indexOf('const FILMS = [');
  const b = a < 0 ? -1 : s.indexOf('\n];', a);
  if (a < 0 || b < 0) throw new Error('films.mjs: FILMS list not found in build-film-sheets.mjs — refusing to guess');
  // eslint-disable-next-line no-new-func
  const films = new Function(`return ${s.slice(a + 'const FILMS = '.length, b + 2)};`)();
  if (!Array.isArray(films) || !films.length) throw new Error('films.mjs: FILMS is empty');
  for (const f of films) {
    if (!f.slug || !f.title || !f.file || !Array.isArray(f.poems)) {
      throw new Error(`films.mjs: film record missing slug/title/file/poems: ${JSON.stringify(f).slice(0, 120)}`);
    }
  }
  return films;
}

/** fragment id ("093") → [{ slug, title, file }] of every film that quotes it. */
export function filmsByFragment(films = loadFilms()) {
  const map = new Map();
  for (const f of films) {
    for (const [n] of f.poems) {
      const id = String(n).replace('#', '');
      if (!map.has(id)) map.set(id, []);
      if (!map.get(id).some((x) => x.slug === f.slug)) map.get(id).push({ slug: f.slug, title: f.title, file: f.file });
    }
  }
  return map;
}

/**
 * fragment id → English title, ONLY where a published sheet already names a
 * Russian fragment as "English (Русский)". Nothing is translated here; a title
 * with no published English form gets no entry.
 */
export function englishTitles(films = loadFilms()) {
  const map = new Map();
  const CY = /[А-Яа-яЁё]/;
  for (const f of films) {
    for (const [n, t] of f.poems) {
      const m = /^(.+?)\s*\(([^()]+)\)\s*$/.exec(String(t));
      if (!m || CY.test(m[1]) || !CY.test(m[2])) continue;
      map.set(String(n).replace('#', ''), { en: m[1].trim(), ru: m[2].trim() });
    }
  }
  return map;
}
