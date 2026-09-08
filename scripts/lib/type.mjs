/**
 * type.mjs — the typographic system, defined once.
 *
 * The site was set in Space Grotesk + JetBrains Mono + Inter. That stack is not
 * wrong, it is just dated — it reads 2021, and it is what every developer
 * portfolio was set in. For a gallery it says "startup", not "underground".
 *
 * ── What changes, and why it reads sharper ──────────────────────────────────
 *
 * DISPLAY → Syne. Drawn for a contemporary art centre, and it shows: wide,
 * slightly brutalist geometry with cut terminals and an odd, confident 'A'. It
 * is an art-institution face with an edge, which is exactly what this is. Space
 * Grotesk stays as the fallback so nothing collapses if the font fails.
 *
 * TECHNICAL → Geist Mono. Cleaner and more even than JetBrains Mono at the tiny
 * sizes this page uses for labels, dates and numbers, and it holds up under the
 * wide letter-spacing those labels need.
 *
 * THE ACTUAL SHARPNESS is not the fonts, it is the spacing contrast:
 *
 *   · Large type gets NEGATIVE tracking (-0.03 to -0.05em). Big headlines used
 *     to breathe; now they bite. This one move does more than any font swap.
 *   · Tiny mono labels get WIDE tracking (0.16 to 0.34em). The tension between
 *     tight-huge and loose-tiny is what the eye reads as "designed".
 *   · Numbers are tabular, so #045, the dates and the counts sit in true columns
 *     instead of shimmering by a pixel per row.
 *
 * What is deliberately NOT touched: the glitch animation, the red glow, the
 * gradient logo, every colour. Those are the underground identity and they are
 * not mine to sand off. This changes letterforms and spacing — which is what was
 * asked for — and nothing else.
 */

export const FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Syne:wght@400..800' +
  '&family=Geologica:wght@400;500;600;700&family=Geist+Mono:wght@300;400;500&display=swap';

/** Display: headlines, part titles, poem titles. */
export const DISPLAY = "'Syne','Space Grotesk','Inter',sans-serif";

/** Technical: labels, numbers, dates, nav, anything uppercase and small. */
export const MONO = "'Geist Mono','JetBrains Mono',monospace";

/**
 * TITLES — Geologica, and the reason is not taste, it is coverage.
 *
 * Syne has NO CYRILLIC. Forty-three of the ninety-nine titles are Russian, so
 * they were silently falling through Syne and Space Grotesk to Inter: English
 * titles set in the new display face, Russian titles in a plain grotesque, half
 * the corpus looking unstyled. Measured, not guessed — "Hungry Earth" renders
 * 269px wide in Syne, "Последняя Осень" renders at Inter's width.
 *
 * Geologica is a technical grotesque with sharp terminals and full Cyrillic, so
 * both halves of the vault are finally set in the same voice. Syne stays for the
 * hero, the logo and the section titles, which are always Latin.
 *
 * ANY display face used for poem titles MUST cover Cyrillic. This is the trap.
 */
export const TITLE = "'Geologica','Syne','Inter',sans-serif";

/**
 * VERSE — Geist Mono. The poems are the point, and they were set in Inter
 * italic, which is an oblique of a UI face: soft, and the same letterforms as
 * every dashboard on the internet.
 *
 * Monospace is the sharper and more current answer here, and it is not a costume:
 * this is blockchain poetry written by someone who codes, and mono makes each
 * poem read like something committed rather than something posted. Upright, not
 * italic — mono italic is a slant, not a design. Full Cyrillic, so the Russian
 * half sets identically to the English half.
 */
export const VERSE = "'Geist Mono','JetBrains Mono',monospace";

/** Body prose — unchanged. */
export const BODY = "'Inter',sans-serif";

/** Tracking scale. Negative for display, positive for small caps-y labels. */
export const TRACK = {
  hero: '-.05em',
  display: '-.03em',
  title: '-.02em',
  label: '.16em',
  labelWide: '.24em',
  logo: '.34em',
};
