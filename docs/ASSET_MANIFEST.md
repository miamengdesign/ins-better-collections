# Asset Manifest — runtime assets & visual references

Inventory of the assets the site is actually built from, updated to match the **current** repo. Two separate trees exist and must not be confused:

- **`/public/images`** — the **runtime source of truth**. Every image the deployed site renders comes from here. These are the exported, decomposed PNG pieces, grouped into one `<Section> asset/` folder per section.
- **`/references/png`** and **`/references/svg`** — **visual reference snapshots only** (full-frame, flattened mockups of each Figma screen). They exist for design QA / diffing the live build against Figma. **They must never be rendered directly as full-page runtime screens**, imported by a component, or shipped to the browser.

No assets or application code were changed to produce this document.

---

## Governing rules

1. **`references/png` and `references/svg` are reference-only.** Use them to read copy/layout/spacing when building a section in HTML/CSS, never as a runtime `<img>`/background. None of the 18 full-frame files in either folder is a runtime asset.
2. **`public/images` is the runtime source of truth.** If a section needs a raster visual, it comes from the matching `<Section> asset/` folder. There are currently **no SVG files** and **no gradient/background image files** in `public/images` — backgrounds and the rainbow gradient are produced with HTML/CSS, not a shipped asset.
3. **Preserve every PNG's native aspect ratio.** Never stretch a runtime asset non-uniformly (no per-axis scaling). Size by width or height and let the other axis follow.
4. **Do not duplicate baked-in text.** Where a runtime PNG already contains visible text (a callout label, an annotation, a caption), do not re-type that same text as HTML on top of it. Use HTML text only for content the PNG does *not* already contain, or where semantics/interactivity require real markup (headings, links, buttons, the step tracker, list items, footer).

---

## Current runtime tree (`/public/images`) — 16 PNGs

```
public/images/
  01 Hero asset/
    01 Hero bg.png                         6912 × 4468
  03 Current Experience asset/
    03 Current Experience 1 pic1.png        1010 × 2266
    03 Current Experience 1 pic2.png        1014 × 2266
    03 Current Experience 1 pic3.png        1046 × 2269
    03 Current Experience 1 txt.png         1376 × 592
    03 Current Experience 2 group1.png      2796 × 2838
    03 Current Experience 2 group2.png      2556 × 2316
    03 Current Experience 3 pic.png         3190 × 2270
  04 Solution asset/
    04 Solution 1 pic.png                   2420 × 3657
    04 Solution 2 pic.png                   2544 × 3668
    04 Solution 3 pic.png                   2672 × 3669
  05 Prototype asset/
    05 Prototype pic.png                    1724 × 3524
  06 Behind asset/
    06 Behind 1 pic1.png                    3479 × 3420
    06 Behind 1 pic2.png                    3645 × 4124
    06 Behind 1 pic3.png                    2843 × 2872
    06 Behind 1 pic4.png                    2584 × 2328
```

## Reference-only tree (`/references`) — 18 PNG + 18 SVG

Full-frame flattened mockups; **never rendered at runtime**. One file per screen:

```
01 Hero
02 Why Collections 1   02 Why Collections 2   02 Why Collections 3
02 Why Collections 4   02 Why Collections 6
03 Current Experience 1   03 Current Experience 2   03 Current Experience 3
04 Solution 1   04 Solution 2   04 Solution 3
05 Prototype
06 Behind 1   06 Behind 2
07 Wrapup 1   07 Wrapup 2   07 Wrapup 3
```

Each name exists in both `references/png/<name>.png` and `references/svg/<name>.svg`.

---

## 01 · Hero

The Hero is **one complete, flattened artwork** — the entire collage (floating UI cards, teddy-bear photo, post mockup, badges, pills, stat rail, and the title) is already baked into a single PNG. It is intentionally *not* a set of separable elements.

| File | Runtime? | Usage |
|---|---|---|
| `01 Hero asset/01 Hero bg.png` | **Runtime** | The complete visible Hero artwork. Render it as **one** image. **Do not rebuild the Hero from separate pieces.** Preserve its native aspect ratio (6912 × 4468 ≈ `1.547:1`). Later, the whole Hero artwork moves as one card (see `ANIMATION_SPEC.md §01`). |
| `references/png/01 Hero.png`, `references/svg/01 Hero.svg` | **Reference-only** | Full-frame mockup for QA. Never rendered. |

- **No separate "Scroll down to continue" asset exists in `public/images`.** Any such cue is part of the single Hero artwork; do not add a duplicate overlay image. If a breathing-cue element is wanted, it is an HTML/CSS element, not a shipped asset.
- **No text is re-typed over the artwork** — the title and all UI-card copy are baked into `01 Hero bg.png`. The only HTML text in this section is an accessible `<h1>` (visually hidden) for the document heading hierarchy.

---

## 02 · Why Collection

**No runtime image assets.** This section is built entirely with **HTML/CSS** plus the project's gradient/background treatment (a CSS-produced rainbow gradient + scrim, not a shipped image).

- All five copy lines — the heading `Why Collection?` and the four narrative statements — are **real HTML text nodes**, sized/positioned/animated by scroll progress (see `ANIMATION_SPEC.md §02`).
- The `references/png|svg/02 Why Collections 1–4` and `…6` files are **point-in-scroll reference snapshots** of the reveal, used only to match typography/position. They are **not** runtime images and **not** frames to crossfade between.

---

## 03 · Current Experience

Runtime PNGs exist **per state** and map exactly as the folder now contains them. The shared chrome — the "Current Experience" title, the `Discover → Save → Create → Collaborate → Manage` step tracker, and the one-line bullet — is **HTML/CSS** (it is stateful and changes per screen), not an asset.

| State | Runtime asset(s) in `03 Current Experience asset/` | Notes |
|---|---|---|
| **State 1** | `03 Current Experience 1 pic1.png`, `…1 pic2.png`, `…1 pic3.png` (three phone mockups) + `03 Current Experience 1 txt.png` (the "UI Inconsistency" callout) | Four separate PNGs so each can animate independently. `…1 txt.png` already contains the callout text — do not re-type it as HTML. |
| **State 2** | `03 Current Experience 2 group1.png`, `…2 group2.png` | State 2 is exported as **two grouped composites** (phones + their callouts already combined into each group), not as separate `pic`/`txt` files. Any callout text is baked into these PNGs. |
| **State 3** | `03 Current Experience 3 pic.png` | State 3 is a **single** wide PNG (phone + its callout combined). No separate `txt` asset exists for state 3. |

- Render each PNG at its native aspect ratio.
- The header/tracker/bullet copy is the only HTML text in this section; the callout/annotation copy lives inside the PNGs and must not be duplicated as HTML.
- `references/png|svg/03 Current Experience 1–3` are full-frame composites, **reference-only**.

---

## 04 · Solutions

**One runtime `pic.png` per Solution state (1–3).** There is no separate background, panel, or caption asset — the split panel/gradient treatment is CSS and the left-column copy is HTML.

| State | Runtime asset in `04 Solution asset/` |
|---|---|
| Solution 01 | `04 Solution 1 pic.png` |
| Solution 02 | `04 Solution 2 pic.png` |
| Solution 03 | `04 Solution 3 pic.png` |

- Each `pic.png` is the phone mockup for that solution (and already contains any caption baked beneath the phone — do not re-type that caption as HTML).
- **HTML text** (no asset exists for it): the `Solution 0N` eyebrow, the heading (e.g. "Reels Detail Enhancement"), the green checkmark badge label, and the explanation paragraph.
- Preserve each PNG's aspect ratio; never stretch.
- `references/png|svg/04 Solution 1–3` are full-frame composites, **reference-only**.

---

## 05 · Prototype

| File | Runtime? | Usage |
|---|---|---|
| `05 Prototype asset/05 Prototype pic.png` | **Runtime** | The clickable prototype mockup. Render it as one PNG **wrapped in a real `<a href={PROTOTYPE_URL}>`** (see `ANIMATION_SPEC.md §05`). Preserve aspect ratio. |
| `references/png/05 Prototype.png`, `references/svg/05 Prototype.svg` | **Reference-only** | Full-frame mockup. Never rendered. |

- **No separate `txt` / "Tap here to start" asset exists in `public/images`.** That caption, plus the `Prototype` eyebrow and the "Click the Mockup, try it by yourself!" heading, are **HTML text** (unless already baked into `05 Prototype pic.png`, in which case they must not be duplicated).
- The split panel / dark gradient side is a CSS treatment, not an asset.

---

## 06 · Behind the Work

**Four separate runtime collage images**, reused for both scroll states (the second state is the same four PNGs under a CSS dark/blur overlay — no second asset set).

| File in `06 Behind asset/` | Runtime? | Usage |
|---|---|---|
| `06 Behind 1 pic1.png` | **Runtime** | Scattered "messy page" sheet 1 (collage layer) |
| `06 Behind 1 pic2.png` | **Runtime** | Sheet 2 |
| `06 Behind 1 pic3.png` | **Runtime** | Sheet 3 |
| `06 Behind 1 pic4.png` | **Runtime** | Sheet 4 |

- The "Behind the Work" heading and both paragraphs are **HTML text**, not assets.
- `references/png|svg/06 Behind 1` and `06 Behind 2` are full-frame composites, **reference-only** (used to read the two states' copy/layout only).

---

## 07 · Wrap Up

**Semantic HTML/CSS only — no runtime image asset.** Normal document flow (no pinning). Built as stacked HTML over the project's CSS gradient/background treatment: heading, closing paragraph, "Tools:" list, "Quick Link:" list, and footer.

- Quick Links (`Figma Prototype`, `Github`, `Vercel`) are real `<a>` tags.
- "Back to top" is a real `<button>` (its arrow glyph is an HTML element, not an asset); clicking it smooth-scrolls to the Hero section. There is **no** `Back to top` image asset in `public/images`.
- `references/png|svg/07 Wrapup 1–3` are reference snapshots of how the page looks at three scroll positions — **reference-only**, not animation keyframes.

---

## Global / cross-section notes

- **Gradient / backgrounds**: the shared rainbow gradient and section backgrounds are produced with **HTML/CSS**, not a shipped image. There is no `bg.svg`/`bg.png` gradient file in `public/images`.
- **Fonts** (`/public/fonts/Instagram Sans*.ttf`, `Instagram Sans Headline.otf`) are the only other runtime static assets and are loaded via `@font-face` in `src/index.css`.
- **No SVG runtime assets exist.** Any component still pointing at a flat `/images/*.svg` path (e.g. `02 Why Collections bg.svg`, `03 … pic*.svg`, `05 Prototype txt.svg`) is referencing a file that no longer exists and must be repointed to the PNG runtime tree above (or to a CSS treatment) during the code pass. This manifest is the target the code should be brought in line with.

## Summary counts

- **Runtime assets (render directly): 16 PNGs** in `public/images`, all nested under `<Section> asset/` folders. Sections **02** and **07** have **zero** runtime image assets (HTML/CSS + CSS gradient only).
- **Reference-only: 36 files** (18 in `references/png` + 18 in `references/svg`). Never rendered at runtime.
- **Content with no exported asset** (headings, paragraphs, badges, step tracker, list items, links, footer, back-to-top control) is built as semantic HTML, styled from the reference mockups.
