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

Revised during implementation: the first build was too small and its smoulder was
too faint to notice, so the bang got bigger and the cool-down got much longer.

| | |
|---|---|
| Left blast | starts at 0ms |
| Right blast | starts at 250ms |
| Burst duration | 2400ms (`--boom-burst`), covering bang **and** cool-down |
| Bang peak | at 22% of that, so ~530ms in |
| Scale curve | 0.15 -> `--boom-peak` -> 1.14 -> 1.05 -> 1.0 |
| `--boom-peak` | 1.74 on laptop, 2.9 on phone, where the shrunk page makes a laptop-sized blast read as a flicker |
| Resting size | always back to `width: 384px` in its original spot; only the detonation is larger |
| Opacity | 0 -> 1, full by 8% |
| Flash | brightness 1.75 and saturation 1.5 at detonation, decaying to neutral by the end |
| Rotation drift | 3 degrees during the burst, opposite directions per side |
| Idle glow | brightness +14%, scale +3%, plus a fraction of a degree of wobble |
| Glow period | 4.5s left, 5.3s right |

The burst's final keyframe lands exactly on the glow's resting values, so the
handover is invisible.

**Each side's glow starts the instant that side's own burst ends** (2400ms left,
2650ms right). The two stay out of phase through their different loop *lengths*,
not through a later start. An earlier version delayed the right glow to 4850ms to
desynchronise them, which left that blast frozen for 2.2 seconds; a Codex review
caught it.

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

### The fire has to be the top layer, which needed an HTML change

The design originally promised no HTML changes. That did not survive: the blasts
were children of `.cover`, which has `overflow: hidden`, so they were **clipped at
the cover's boundary** and no `z-index` could ever lift them over the intro text or
the grids. Clipping beats stacking.

So both blast `<img>` tags moved out of `<header class="cover">` to sit directly
under `<body>`, before the header. They are absolutely positioned from the page's
top and horizontal centre, which puts them in the same place as before. `.deco-boom`
then takes `z-index: 10`, above the intro text (`z-index: 1`) and the grids, and
`body` takes `overflow-x: hidden` so the page does the horizontal cropping the
cover used to do.

The rainbow stays inside `.cover` and keeps its crop, so its masked fade is
unaffected.

Consequence, accepted deliberately: the fire also paints over the wordmark, so at
peak the bang washes across "SUDOKU". Bumping `.cover > div` above `z-index: 10`
would reverse that if it ever reads badly.

### Tunable knobs, all on `:root`

| variable | default | what it does |
|---|---|---|
| `--boom-burst` | 2400ms | whole arc, bang plus cool-down |
| `--boom-peak` | 1.74 | how far the blast swells; phone overrides to 2.9 |
| `--boom-offset` | 544px | distance from centre to each blast; phone overrides to 435px |

Phone-only extras under `.small-screen`: the offset above, plus the left blast
sitting at `top: 46px` instead of 34px so the pair are not level.

Files touched: `style.css`, `index.html`, `en/index.html`.

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
