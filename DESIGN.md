# TekSpyk Design System

Reference: viewmax.io landing plus viewmax.io/onboarding, adapted for an AI engineering academy.

## Theme

Light only. White page, near-black ink, one committed blue. Soft blue radial tints at the page edges give depth without gradient blobs.

## Color

| Token | Value | Use |
|---|---|---|
| --bg | oklch(100% 0 0) | page background |
| --ink | oklch(15% 0.01 260) | headings, primary text |
| --ink-soft | oklch(45% 0.015 260) | body and supporting text |
| --ink-faint | oklch(62% 0.01 260) | tertiary labels |
| --blue | oklch(55% 0.22 262) | primary actions, links, highlights (#2563eb family) |
| --blue-deep | oklch(48% 0.21 262) | hover state |
| --surface | oklch(97% 0.003 260) | option cards, quiet panels |
| --line | oklch(92% 0.005 260) | hairline borders |
| --tint | blue at 6 to 10 percent alpha | edge washes, badges |

Strategy: Restrained with one committed blue. Accent words in headlines use solid --blue, never gradient text.

## Typography

Geist Sans (already in the project, SF Pro voice) for everything.

- Display: weight 800, letter-spacing -0.03em, clamp(2.5rem, 1.4rem + 4.5vw, 4.25rem), text-wrap balance
- Section headings: weight 800, -0.02em, clamp(1.75rem, 1.2rem + 2vw, 2.5rem)
- Quiz question: 26px equivalent, weight 800, -0.025em
- Body: 16 to 18px, weight 400, --ink-soft, line-height 1.6, max 68ch

No eyebrow labels. Sections open with headline then one supporting sentence.

## Components

- Primary button: pill, --blue bg, white text, weight 600, arrow glyph, hover to --blue-deep with slight lift
- Announcement pill: hairline border, white bg, soft shadow, accent words in solid blue or pink solid
- Option card (quiz): --surface bg, 14px radius, 18px 16px padding, full-width, emoji leading, hover border blue, selected state blue tint
- Feature card: white bg, 20px radius, hairline border, soft shadow on hover
- Marquee card: 16px radius, thumbnail block with solid tinted background and icon, stat line
- FAQ: native details/summary accordion with rotating chevron
- Inputs: 14px radius, --surface bg, hairline border, blue focus ring

## Layout

- Max content width 1120px, hero centered
- Section vertical rhythm clamp(4rem, 3rem + 4vw, 7rem)
- Quiz: single centered column, max 560px, progress bar under header

## Motion

- Step transitions: 300ms fade and 12px slide, ease-out expo, AnimatePresence
- Marquee: continuous translateX loop, 40s, pauses on hover
- Curriculum loop: active item auto-advances every 2.8s, click to pin
- All motion has prefers-reduced-motion fallbacks (instant or crossfade); content never hidden by default
