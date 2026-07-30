# Animated explosions on the cover — design

Date: 2026-07-30
Status: approved by Jelle (design conversation, this session)
Purpose: the two comic blasts flanking the wordmark currently sit there as still
photos. Make them detonate when the page opens, then keep smouldering, so the
cover feels alive without pulling attention off the text.

## Goals

- Each blast bursts outward on page load, cinematic rather than snappy.
- The two fire out of sync, so they read as two bangs, not one symmetrical event.
- After the burst they settle into a subtle continuous glow, as if still burning.
- Burst speed is one variable, so dropping from cinematic to snappy is a one-line
  change if the slow version feels sluggish in practice.

## Non-goals

- No new image assets, no frame sequences, no video. The existing single-frame
  cutout is all we use.
- No JavaScript. CSS animations start at load on their own.
- No scroll trigger and no re-firing when scrolling back to the cover. Once per
  page load only.
- Frame-by-frame flame movement (real fire evolving shape) is explicitly out.
  See "Possible upgrade".

## Constraint that shapes the whole thing

`assets/boom.webp` is a **single still frame**, a 560x334 photographic cutout with
real transparency. There is no motion in the asset, so all movement has to come
from CSS transforms and filters applied to that one frame.

## Choreography

| | |
|---|---|
| Left blast | starts at 0ms |
| Right blast | starts at 150ms |
| Burst duration | 900ms (`--boom-burst`) |
| Scale curve | 0.2 -> 1.12 -> 1.0 |
| Opacity | 0 -> 1, reaching full early in the curve |
| Flash | brightness and saturation raised at the front of the curve, decaying to normal as it settles |
| Rotation drift | 1-2 degrees during the burst, opposite directions per side |
| Idle glow | 5s loop, brightness +~5%, scale +~1.5%, ease-in-out, infinite |
| Glow offset | the two sides are 2.5s apart so they never breathe in sync |

The idle glow must pick up from the burst's end state so there is no visible jump
between the two animations.

## How it is built

**Independent transform properties are the key mechanism.** The blasts already
carry `transform: rotate(8deg)` (left) and `transform: rotate(-16deg) scaleX(-1)`
(right). CSS's standalone `scale` and `rotate` properties are applied *in addition
to* `transform`, not instead of it, so animating those leaves the existing tilt and
mirror untouched. Animating `transform` itself would have meant either duplicating
the per-side base transform inside every keyframe or wrapping each blast in an
extra element.

Animated properties: `scale`, `rotate`, `opacity`, `filter` (brightness and
saturation only).

Support: individual transform properties landed in Safari 14.1 and Chrome 104, so
2022 onward. On anything older the blasts simply appear in place, un-animated,
which is the current behaviour.

Files touched: `style.css` only, next to the existing `.deco-boom` rules.
`--boom-burst` is declared on `:root` beside the other custom properties.

## Reduced motion

Under `@media (prefers-reduced-motion: reduce)`, both the burst and the glow are
switched off and the blasts render in their final state. This matches how the grid
hover already behaves (`style.css`, the existing `prefers-reduced-motion` rule).

## Performance and layout safety

- `scale` and `opacity` are compositor-friendly and do not reflow, so nothing on
  the page shifts while the burst runs.
- `filter` is limited to `brightness()` and `saturate()`. No `blur()`, which is
  the expensive one on a phone.
- `.cover` keeps `overflow: hidden`, so a blast growing past its final size stays
  cropped to the corner exactly as it is now.

## Verification

CSS animation cannot be unit-tested here, so verification is by eye plus a few
explicit checks:

1. Laptop, window >= 1120px: both blasts burst, staggered, and settle into the
   glow with no jump between the two animations.
2. Phone at the 900px layout: same, and the burst does not shift the wordmark or
   the intro text.
3. Reduced motion enabled (macOS System Settings, Accessibility, Display, Reduce
   motion): no burst, no glow, blasts sit in their final position.
4. Confirm the existing tilt and mirror survive: the right blast must still lean
   right-side-up and stay mirrored while it animates.

## Possible upgrade, not in scope

A second overlaid copy of the blast per side, offset in time, so the overlap
between the two copies changes shape and the fire evolves rather than merely
scaling. This needs two extra `img` tags per page, so the free version gets built
and looked at first; this is only worth it if the single-layer burst reads flat.
