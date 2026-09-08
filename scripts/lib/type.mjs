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
  'https://fonts.googleapis.com/css2?family=Syne:wght@400..800&family=Geist+Mono:wght@300;400;500&display=swap';

/** Display: headlines, part titles, poem titles. */
export const DISPLAY = "'Syne','Space Grotesk','Inter',sans-serif";

/** Technical: labels, numbers, dates, nav, anything uppercase and small. */
export const MONO = "'Geist Mono','JetBrains Mono',monospace";

/** Body and verse — unchanged. The poems keep the setting they have always had. */
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
