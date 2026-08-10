# Asset Manifest — `/public/images`

Inventory of every exported Figma asset, how it was classified, and how it should be used when the site is assembled. No assets or application code were changed to produce this document.

## How classifications were determined

- **Full-frame vs. decomposed**: every section has one or more files sized `1728×1117` (the full desktop frame). Where a matching set of smaller `bg` / `pic` / `txt` files also exists, byte-size and `<image>`/`<path>` tag counts were compared — the decomposed files sum to essentially the same content as the full frame, confirming the full frame is a **flattened composite** of those pieces, not independent content.
- **Text-as-vector vs. text-as-raster**: files were scanned for `<image>` (embedded raster) vs `<path>` (outlined vector) tags. Most on-screen "photos" are embedded raster inside an SVG wrapper; most typography was exported as outlined vector paths (Figma's "flatten text" export), not `<text>` elements — so none of it is selectable/real text in the file itself.
- **Shared gradient detection**: the 5-stop rainbow gradient (`#7638FA → #D300C5 → #FF0069 → #FF7A00 → #FFD600`) was found with byte-identical stop values in `02 Why Collections bg.svg`, `03 Current Experience 1 bg.svg`, `04 Solution bg.svg`, `05 Prototype bg.svg`, and all three `07 Wrapup` frames — this is one brand background reused across sections, not five separate designs.
- **Reference PNGs**: the flattened `/references/*.png` mockups (not in scope of this manifest, but used to read copy/layout) were used to confirm what each full-frame SVG actually shows, since many of them are too large/complex to eyeball directly.

Legend for **Format** column: **SVG-asset** = render the exported file directly (`<img>`, background-image, or inlined `<svg>`); **HTML** = no matching exported asset exists for this content (or it must carry interactive/dynamic state) — implement as real markup, styled to match the reference mockup exactly.

---

## 01 · Hero

The Hero is intentionally static artwork, not a set of independently animated cards. Per interaction direction: (1) the "Scroll down to continue" cue has a slow breathing opacity loop, and (2) on scroll into Section 02, the entire Hero moves as a single full-screen card translating upward out of view. Neither behavior requires the individual floating UI cards (comment bubble, teddy-bear photo, post mockup, etc.) to be separable — so the flattened `01 Hero bg.svg` is exactly the right shape of asset, and no per-card decomposition is needed.

| File | Purpose | Reference-only / Runtime | Layer order | Interaction | Format |
|---|---|---|---|---|---|
| `01 Hero bg.svg` | Full-bleed, single flattened visual: the collage of floating UI cards (comment bubble, teddy-bear photo card, post mockup, "ADD YOURS/SAVED", heart/comment/share row, "Share with" card, "COMPONENTS" badge, stat rail, "TIKTOK" pill, "COLLECTION" pill, "Mia Meng" pill) plus the title | **Runtime** — rendered as one static image, the whole Hero section is the animated unit (translate-up on scroll into Section 02), not its contents | 1 (fills the full-screen Hero card) | No independent motion inside the card; the card itself translates as a whole on scroll-out | SVG-asset |
| `01 Hero.svg` | Same collage plus one extra outlined-text element (near-identical byte size to `bg.svg`, +1 `<path>`) — almost certainly `bg.svg` + a baked-in "scroll down" hint | **Reference-only** | — | — | — |
| `01 Hero.png` | Rasterized flatten of the full hero frame | **Reference-only** (usable as a `poster`/LCP placeholder only if needed) | — | — | — |

---

## 02 · Why Collection

| File | Purpose | Reference-only / Runtime | Layer order | Interaction | Format |
|---|---|---|---|---|---|
| `02 Why Collections bg.svg` | The shared rainbow gradient + 70%-black scrim + backdrop-blur, no text | **Runtime** | 1 (pinned background for the whole scrollytelling sequence) | No | SVG-asset |
| `02 Why Collections bg2.svg` | Same bg + small persistent "Why Collection?" label baked in as one outlined path | **Reference-only** (shows the "shrunk heading" state) | — | — | — |
| `02 Why Collections 1.svg` | bg + large centered "Why Collection?" (step 1 of the reveal) | **Reference-only** | — | — | — |
| `02 Why Collections 2.svg` | bg2 + paragraph "Collections sit between…" (step 2, cumulative) | **Reference-only** | — | — | — |
| `02 Why Collections 3.svg` | bg2 + step-2 paragraph (dimmed) + "People save posts…" (step 3, cumulative) | **Reference-only** | — | — | — |
| `02 Why Collections 4.svg` | Cumulative through "Yet the current experience…" (step 4) | **Reference-only** | — | — | — |
| `02 Why Collections 5.svg` | Cumulative through "I focused on improving…" (step 5, final) | **Reference-only** | — | — | — |
| `02 Why Collections bg.png` | Raster fallback of the gradient bg | **Reference-only** | — | — | — |

**Read as**: this is a single pinned section with 5 scroll-linked text steps, each replacing/demoting the previous line, over one static gradient. The numbered files are baked *cumulative snapshots* of each step (confirmed by strictly increasing path counts: 1→2→3→3→2 as lines are added then the top ones shrink), not five independent slides to crossfade between. **None of the 5 numbered files should be rendered as full images** — the only runtime asset here is the background; all five copy lines ("Why Collection?", "Collections sit between…", "People save posts…", "Yet the current experience…", "I focused on improving…") must be real HTML text nodes whose visibility/size/position is driven by scroll progress, matching the typography/position seen in these references.

---

## 03 · Current Experience

Shared chrome across all three sub-screens (title "Current Experience", the `Discover → Save → Create → Collaborate → Manage` step tracker with one bold/active step, and a one-line bullet) is only exported once, in `03 Current Experience 1 bg.svg`, as 12 outlined-text/shape paths (fills `#F7F9F9` panel/label color, `#DBDBDB` inactive-step color) — confirming this chrome is meant to be *coded*, not baked per state, since it changes per screen.

| File | Purpose | Reference-only / Runtime | Layer order | Interaction | Format |
|---|---|---|---|---|---|
| `03 Current Experience 1 bg.svg` | Header chrome (title/step-tracker/bullet) + white rounded shelf-panel shape, for screen 1's state | **Reference-only for the text/state**; the plain rounded-shelf backdrop shape is simple enough to be the visual reference for a coded panel | 1 (shell, shared across 1/2/3) | Step tracker is stateful | Mixed: shell → HTML/CSS; step labels + bullet copy → **HTML** |
| `03 Current Experience 1 pic1.svg` | Phone mockup — "Main feed-Reel" (with colored annotation brackets baked in) | **Runtime** | 2 | Independently animated (enters with pic2/pic3) | SVG-asset |
| `03 Current Experience 1 pic2.svg` | Phone mockup — "Main feed-Post" | **Runtime** | 2 | Independently animated | SVG-asset |
| `03 Current Experience 1 pic3.svg` | Phone mockup — "Reels Detailed View" | **Runtime** | 2 | Independently animated | SVG-asset |
| `03 Current Experience 1 txt.svg` | "⚠ UI Inconsistency" callout card (outlined vector text, no raster) | **Runtime** | 3 (floats above/between the phones) | Independently animated | SVG-asset |
| `03 Current Experience 1.svg` | Flattened composite of the above 5 files | **Reference-only** | — | — | — |
| `03 Current Experience 2 pic1.svg` | Phone mockup — "Create New Collection" | **Runtime** | 2 | Independently animated | SVG-asset |
| `03 Current Experience 2 pic2.svg` | Phone mockup — "Choose Who to Share with" | **Runtime** | 2 | Independently animated | SVG-asset |
| `03 Current Experience 2 txt1.svg` | "❗ Blocked User Flow" callout | **Runtime** | 3 | Independently animated | SVG-asset |
| `03 Current Experience 2 txt2.svg` | "❤ Broken Collection Creation" callout (spans under both phones) | **Runtime** | 3 | Independently animated | SVG-asset |
| `03 Current Experience 2 txt3.svg` | "🔒 Limited Collaboration" callout | **Runtime** | 3 | Independently animated | SVG-asset |
| `03 Current Experience 2.svg` | Flattened composite | **Reference-only** | — | — | — |
| `03 Current Experience 3 pic.svg` | Phone mockup — "Manage the Collection" | **Runtime** | 2 | Independently animated | SVG-asset |
| `03 Current Experience 3 txt.svg` | "🗂 Missing Share Pathways" callout | **Runtime** | 3 | Independently animated | SVG-asset |
| `03 Current Experience 3.svg` | Flattened composite | **Reference-only** | — | — | — |

Per the interaction rules, the phone mockups and callout cards must stay as separate elements (already true of the exports) so each can animate independently — none of the three full-frame composites should be used as a shortcut.

---

## 04 · Solutions

`04 Solution bg.svg` uses the identical shared rainbow gradient (see Methodology) and is reused unmodified behind all three solution screens.

| File | Purpose | Reference-only / Runtime | Layer order | Interaction | Format |
|---|---|---|---|---|---|
| `04 Solution bg.svg` | Shared gradient/panel-split background for all three solution screens | **Runtime** | 1 (shared) | No | SVG-asset |
| `04 Solution 1 pic.svg` | Phone mockup, "Reels Detail Enhancement" | **Runtime** | 2 | Independently animated (slide/fade per screen) | SVG-asset |
| `04 Solution 1 txt.svg` | Small icon + caption ("Tap 'Collection' to Save a Reel") | **Runtime** | 3 | Independently animated | SVG-asset |
| `04 Solution 1.svg` | Flattened composite | **Reference-only** | — | — | — |
| `04 Solution 2 pic.svg` | Phone mockup, "New Collection Enhancement" | **Runtime** | 2 | Independently animated | SVG-asset |
| `04 Solution 2 txt.svg` | Caption ("Select multiple friends from the list") | **Runtime** | 3 | Independently animated | SVG-asset |
| `04 Solution 2.svg` | Flattened composite | **Reference-only** | — | — | — |
| `04 Solution 3 pic.svg` | Phone mockup, "Manage Collection Enhancement" | **Runtime** | 2 | Independently animated | SVG-asset |
| `04 Solution 3 txt.svg` | Caption ("A new 'Share with' bar to manage collaboration") | **Runtime** | 3 | Independently animated | SVG-asset |
| `04 Solution 3.svg` | Flattened composite | **Reference-only** | — | — | — |

**Not exported at all** (visible only inside the full-frame composites, so must be built as real markup, matched to the reference mockups): the "Solution 0N" eyebrow, the heading ("Reels Detail Enhancement", etc.), and the green "✅ …Consistency" checkmark badge + paragraph on the dark panel. These are plain text/box content with no corresponding asset — **Format: HTML**.

---

## 05 · Prototype

| File | Purpose | Reference-only / Runtime | Layer order | Interaction | Format |
|---|---|---|---|---|---|
| `05 Prototype bg.svg` | Split-panel background (white left / gradient right), same shared gradient family | **Runtime** | 1 | No | SVG-asset |
| `05 Prototype pic.svg` | The Reel phone mockup — this is the actual clickable prototype embed per the copy ("Click the Mockup, try it yourself!") | **Runtime** | 2 | **Yes — must be wrapped in a real `<button>`/`<a>`**, not a bare image | SVG-asset (visual) wrapped in HTML control |
| `05 Prototype txt.svg` | Small icon + "Tap here to start" caption, part of the click affordance | **Runtime** | 3 | Sits with/near the interactive control | SVG-asset |
| `05 Prototype.svg` | Flattened composite | **Reference-only** | — | — | — |

**Not exported**: "Prototype" eyebrow and "Click the Mockup, try it yourself!" heading — **Format: HTML**.

---

## 06 · Behind the Work

`06 Behind 2` reuses the same photo collage as `06 Behind 1` under a dark/blurred overlay with new copy (confirmed by identical embedded-image count and the cumulative-reveal pattern also seen in section 02) — it does not need its own pic assets.

| File | Purpose | Reference-only / Runtime | Layer order | Interaction | Format |
|---|---|---|---|---|---|
| `06 Behind 1 pic1.svg` | Scattered "messy page" photo/sketch 1 | **Runtime** | 1 (collage layer, one of several) | Independently animated (stagger-in) | SVG-asset |
| `06 Behind 1 pic2.svg` | Scattered photo/sketch 2 | **Runtime** | 1 | Independently animated | SVG-asset |
| `06 Behind 1 pic3.svg` | Scattered photo/sketch 3 | **Runtime** | 1 | Independently animated | SVG-asset |
| `06 Behind 1 pic4.svg` | Scattered photo/sketch 4 | **Runtime** | 1 | Independently animated | SVG-asset |
| `06 Behind 1.svg` | Flattened composite: pic1–4 + "Behind the Work" + "The clean flow started on messy pages…" | **Reference-only** | — | — | — |
| `06 Behind 2.svg` | Flattened composite: same collage, dark/blurred, + "Before narrowing the scope…" paragraph (next scroll step) | **Reference-only** (reuse pic1–4 + a CSS dark/blur overlay for this step rather than a new asset) | — | — | — |

**Not exported**: "Behind the Work" heading and both paragraphs — **Format: HTML**, cross-faded/promoted the same way as section 02's reveal.

---

## 07 · Wrap Up

Unlike Section 02, this is **not** a pinned, scroll-linked reveal — it's normal vertical document flow. `07 Wrapup 1/2/3.svg` are visual reference snapshots of what different points further down the page look like as the user scrolls past them normally (heading+paragraph, then the Tools/Quick-Link lists, then the footer come into view one after another simply because they sit lower on the page) — they are **not animation keyframes** to drive with scroll progress or JS. They still happen to share the same rainbow gradient background as sections 02/03/04/05 (byte-identical stops), which is the one runtime detail to carry over from them.

| File | Purpose | Reference-only / Runtime | Layer order | Interaction | Format |
|---|---|---|---|---|---|
| `07 Wrapup 1.svg` | Reference snapshot: gradient + "Wrap up" heading + closing paragraph, as seen when this point of the page is in view | **Reference-only** | — | — | — |
| `07 Wrapup 2.svg` | Reference snapshot: further down the same page, "Tools:" and "Quick Link:" lists now in view | **Reference-only** | — | — | — |
| `07 Wrapup 3.svg` | Reference snapshot: further down still, footer ("Mia Meng, Product Designer", "©2026, All Rights Reserved") + "↑ Back to top" now in view | **Reference-only** | — | — | — |

None of the three should be rendered directly, and none should be wired to scroll progress. Build this section as ordinary stacked HTML in normal document flow, over the shared gradient background (reuse `02 Why Collections bg.svg`'s gradient asset rather than shipping a duplicate): heading, closing paragraph, "Tools" list, "Quick Link" list, and footer, laid out top-to-bottom exactly as the three snapshots show at their respective scroll positions.

Micro-interactions (the only interactivity in this section):
- **Quick Links** (`Figma Prototype`, `Github`, `Vercel`) are real `<a>` tags; on hover, font-weight increases (no color/underline change implied beyond that).
- **"Back to top"**: the text itself stays static — only the upward arrow loops with a continuous upward-rolling animation. Clicking it smoothly scrolls back to the Hero (not just "to top of page" generically — the target is the Hero section).

---

## Global / cross-section assets

| File | Purpose | Reference-only / Runtime | Interaction | Format |
|---|---|---|---|---|
| `⇡ Back to top.svg` | "↑ Back to top" label, outlined vector text, single path | **Reference-only** for exact type styling | **Yes — clickable; smoothly scrolls back to the Hero section.** The "Back to top" text stays static; only the upward arrow loops with a continuous upward-rolling animation | **HTML** (real `<button>`/`<a>` with the text as markup and the arrow as a small looping element; outlined-path SVG text isn't focusable/accessible as a control, and the arrow's loop animation needs an independent element anyway) |
| `⇣ Scroll down to continue.png` | Small raster hint ("↓ Scroll down to continue") in the Hero, at the foot of the opening screen | **Runtime** | Slow breathing opacity loop (fade in/out continuously); not clickable | SVG-asset (render the PNG directly; the breathing-opacity animation is applied to the `<img>` via CSS without needing to rebuild it) |
| Shared rainbow gradient (`#7638FA → #D300C5 → #FF0069 → #FF7A00 → #FFD600`) | Brand background used in sections 02, 03 (header strip), 04 (side panel), 05 (side panel), 07 | — | No | One of the existing gradient SVGs, reused by reference rather than duplicated per section |

---

## Summary counts

- **51 files** total in `/public/images`.
- **Runtime (render directly): 24** — all `pic*`, `txt*`, `bg` (non-composite) files, plus `01 Hero bg.svg` (rendered as one static full-screen visual, not decomposed) and the two global cue assets.
- **Reference-only: 27.** Two different reasons a file lands here, not one:
  - *Flattened composites* of already-decomposed runtime pieces, not to be rendered: `01 Hero.svg`/`.png`, every `N.svg` composite in sections 03/04/05, `06 Behind 1.svg`/`2.svg`.
  - *Point-in-scroll snapshots*, not animation keyframes: all `02 Why Collections 1–5` (these **do** drive Section 02's pinned scroll-linked text reveal — the only cinematic scrollytelling section) and all `07 Wrapup 1–3` (these are just what normal document flow looks like further down the page — Section 07 has no scroll-linked animation at all beyond the two named micro-interactions).
- **Content with no exported asset at all** (headings, paragraphs, badges, step-tracker, footer links) must be built as semantic HTML, styled from the reference mockups — this is the majority of section 03's chrome, all of section 04/05's headline copy, section 06's captions, and section 07's heading/paragraph/lists/footer.
