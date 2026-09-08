/**
 * words.mjs — the noun for one piece in the vault, defined once.
 *
 * It used to be "moment", hardcoded in 58 places across index.html: the hero
 * headline, the contents, every part tally, every year run, the find box, the
 * DNA ledger, the MANIFEST, the MINT grid and the manifesto modal. Changing it
 * meant finding all 58 and hoping.
 *
 * "Fragment" was not invented for this. It is already the word Atuona reaches
 * for in its own strongest lines — the hero subtitle reads SOUL FRAGMENTS, the
 * manifesto calls each piece "a digital soul fragment, a piece of consciousness
 * trapped in code", and the LITPROM dedication thanks the editors "for making
 * these soul fragments live when the world wanted them buried." It carries the
 * literary sense (Sappho survives only in fragments), the filmic one (a fragment
 * of footage), and the chain one, without sounding like a product.
 *
 * Change UNIT here and every generated surface follows. scripts/build-words.mjs
 * carries the same change into the hand-written regions.
 */

export const UNIT = {
  one: 'fragment',
  many: 'fragments',
  One: 'Fragment',
  Many: 'Fragments',
  ONE: 'FRAGMENT',
  MANY: 'FRAGMENTS',
  /** The article that reads correctly before `one` — "a fragment", "an artifact". */
  article: 'a',
};

/** "1 fragment" / "35 fragments" */
export const count = (n) => `${n} ${n === 1 ? UNIT.one : UNIT.many}`;

/** The word this replaces. Kept so build-words.mjs knows what to hunt for. */
export const LEGACY_UNIT = 'moment';
