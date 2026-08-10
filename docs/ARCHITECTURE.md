# Architecture — Instagram Collection Redesign Case-Study Site

Implementation architecture for assembling the seven sections from the assets catalogued in `docs/ASSET_MANIFEST.md`. This document describes structure and mechanism only — no layout, copy, or visual design decisions are made here; everything defers to the runtime assets in `/public/images` and the reference mockups in `/references`.

**Current status:** the React/Vite app and all seven section scaffolds already exist and are wired up. `src/App.jsx` mounts the seven section components in order; each section renders a **static first state** with its real markup and (where applicable) its runtime PNG assets in place. The **scroll-driven / timer-driven motion** described in `docs/ANIMATION_SPEC.md` is deliberately **deferred to a later pass** — the DOM structure is authored so that pass needs no restructuring. Where this document lists a motion primitive that does not yet exist in `src/` (e.g. `PinnedStage`, `ScrollCue`, the `hooks/` folder), it is called out as **planned**, not present. The intended motion behavior is unchanged from `ANIMATION_SPEC.md`.

---

## 1. React component structure

One top-level component per section, mounted once, in document order, by `App.jsx`. Each section is a self-contained folder: its own component, its own local styles, and (where needed) its own local scroll-progress hook instance. Nothing about a section's internals is imported by another section.

Current tree (✅ = exists in `src/` today; ⏳ = planned, not yet created, added in the motion pass):

```
src/
  main.jsx                       ✅ Vite entry — mounts <App/> in <StrictMode>
  App.jsx                        ✅ mounts the 7 sections in order (see below)
  index.css                      ✅ @font-face (Instagram Sans) + global tokens
  sections/
    01-hero/            Hero.jsx ✅            Hero.module.css ✅
    02-why-collection/  WhyCollection.jsx ✅   WhyCollection.module.css ✅
    03-current-experience/ CurrentExperience.jsx ✅ CurrentExperience.module.css ✅
    04-solutions/       Solutions.jsx ✅       Solutions.module.css ✅
    05-prototype/       Prototype.jsx ✅       Prototype.module.css ✅
    06-behind-the-work/ BehindTheWork.jsx ✅   BehindTheWork.module.css ✅
    07-wrap-up/         WrapUp.jsx ✅          WrapUp.module.css ✅
  components/                    — shared primitives, see §2
    Stage.jsx           ✅ aspect-locked 1728×1117 frame (static scaffold)
    GradientStage.jsx   ✅ shared gradient/background treatment
    FillBackground.jsx  ✅ helper used by GradientStage
    StepTracker.jsx     ✅ Discover→…→Manage tracker (03)
    PhoneMockup.jsx     ✅ presentational wrapper around a phone-mockup image
    CalloutCard.jsx     ✅ presentational wrapper around a callout image
    BackToTop.jsx       ✅ back-to-top control (rendered inside WrapUp, see §2)
    PinnedStage.jsx     ⏳ planned — pinned scroll-track primitive (§7)
    ScrollCue.jsx       ⏳ planned — Hero breathing cue (§2)
  lib/
    assets.js           ✅ img() path helper for /public assets
  config/
    links.js            ✅ centralized external-link constants (see §2)
  hooks/                ⏳ planned — created in the motion pass
    useScrollProgress.js  ⏳
    useReducedMotion.js   ⏳
    useOneShotInView.js   ⏳
```

`App.jsx` is a thin shell: it renders `<Hero/> <WhyCollection/> <CurrentExperience/> <Solutions/> <Prototype/> <BehindTheWork/> <WrapUp/>` in order and nothing else. `<BackToTop/>` is currently rendered **inside `WrapUp.jsx`'s footer** (not directly by `App.jsx`). `App.jsx` holds no shared scroll state — each section is intended to compute its own progress locally once the motion pass lands (see §8).

---

## 2. Shared components and layout primitives

| Primitive | Used by | Responsibility |
|---|---|---|
| `Stage` ✅ | 01–06 | Aspect-locked `1728×1117` frame with an inner canvas; children position/size themselves in container units. This is the **static scaffold** primitive that exists today; it does **not** yet do scroll-track pinning (that is `PinnedStage`, planned). |
| `PinnedStage` ⏳ | 02, 03, 04, 05 | *Planned (motion pass).* The `height:{N}vh` scroll-track + inner `position: sticky; top:0; height:100vh` wrapper. Exposes local scroll progress `0–1` to its children via a render prop. This is the *only* place scroll-hijacking/pinning mechanics will live — sections consume it, they don't reimplement it. |
| `GradientStage` ✅ | 02, 03 (header strip), 04 (dark panel), 05 (dark panel), 07 (page background) | Renders the shared rainbow-gradient/background treatment as a full-bleed backdrop, via `FillBackground`. **Target:** a **CSS gradient treatment** (there is no shipped gradient image in `public/images` anymore). *Cleanup note:* the current implementation still fetches the removed `02 Why Collections bg.svg`; that reference must be replaced with the CSS treatment in the code pass (see §11). |
| `FillBackground` ✅ | via `GradientStage` | Helper that renders a full-bleed background into its host element. Currently fetches an SVG by name; to be repointed to the CSS gradient treatment (see §11). |
| `StepTracker` ✅ | 03 only | `Discover → Save → Create → Collaborate → Manage`, taking an `activeSteps` prop (e.g. `['Discover','Save']`) to control bold/grey state and the dotted-vs-solid connector between Save and Create. Factored out because it's stateful, reused across 03's three internal states, and non-trivial enough to warrant its own file even though only one section uses it. |
| `PhoneMockup` ✅ | 03, 04, 05 | Thin `<img>` wrapper around a phone-mockup **PNG** asset — consistent sizing, drop-shadow, and (later) the enter/exit animation hook-up, so each section doesn't re-derive mockup presentation from scratch. |
| `CalloutCard` ✅ | 03 (and 04/05 currently) | Thin `<img>` wrapper around a callout/annotation **PNG** asset (renders it, positions it, and later wires its independent fade/slide-in). |
| `BackToTop` ✅ | rendered inside `WrapUp.jsx`'s footer (section 07) | The back-to-top control; a real `<button>` with the "Back to top" text and an arrow glyph element. Owns the smooth-scroll-to-Hero click handler today; the arrow's continuous upward-rolling loop is added in the motion pass. |
| `ScrollCue` ⏳ | 01 only | *Planned (motion pass).* The breathing-opacity Hero cue. Note: there is **no** separate scroll-cue image asset — any cue is an HTML/CSS element (or already baked into the Hero artwork). |
| `config/links.js` ✅ | 05 + 07 | Not a component — a plain constants module. Holds `PROTOTYPE_URL` (the Figma prototype link) as the single source of truth, plus `GITHUB_URL` and `VERCEL_URL` (Quick Links, §07). Imported where needed; the URL strings are never inlined/duplicated. |
| `lib/assets.js` ✅ | all sections | `img(name, folder='images')` — builds an encoded `/public` path for an asset by name. |
| `useScrollProgress(ref, opts)` ⏳ | `PinnedStage`, and any section needing scroll-linked values without full pinning (e.g. Hero's exit) | *Planned (motion pass).* Returns a `0–1` number derived from the element's position in the viewport. Pure function of scroll position — no internal animation state, which is what makes every scroll-linked transition reversible for free (see §8). |
| `useReducedMotion()` ⏳ | every animated component | *Planned (motion pass).* Wraps `matchMedia('(prefers-reduced-motion: reduce)')`; components branch their animation logic on this, not on ad hoc checks scattered per file. |
| `useOneShotInView(ref, {threshold, delay})` ⏳ | 06 only | *Planned (motion pass).* IntersectionObserver + a delay timer + a latch (`hasPlayed`) that never resets. The one deliberately non-reversible, imperative piece of motion logic in the site — isolated to its own hook so it's obviously the exception, not the pattern. |

---

## 3. Runtime assets per section

(Full detail and reasoning in `docs/ASSET_MANIFEST.md`; this is the consumption summary. Every runtime asset is a **PNG** under `/public/images/<Section> asset/` — there are no runtime SVGs.)

- **01 Hero**: `01 Hero asset/01 Hero bg.png` — the **one complete Hero artwork**, rendered as a single image at its native aspect ratio (6912 × 4468). Do not rebuild the Hero from separate pieces. No separate scroll-cue asset.
- **02 Why Collection**: **no runtime image assets.** HTML/CSS only, over the CSS gradient/background treatment. All five copy lines are HTML (see §5).
- **03 Current Experience**: state-based PNGs from `03 Current Experience asset/` — **State 1:** `03 Current Experience 1 pic1.png`, `…1 pic2.png`, `…1 pic3.png` + `…1 txt.png` (callout). **State 2:** `…2 group1.png`, `…2 group2.png` (two grouped composites). **State 3:** `…3 pic.png` (single combined PNG). The title/step-tracker/bullet chrome is HTML+CSS (see §5).
- **04 Solutions**: one PNG per state from `04 Solution asset/` — `04 Solution 1 pic.png`, `04 Solution 2 pic.png`, `04 Solution 3 pic.png`. No separate bg/txt assets; the panel/gradient split and the left-column copy are HTML/CSS (see §5).
- **05 Prototype**: `05 Prototype asset/05 Prototype pic.png` — the clickable mockup, wrapped in an `<a>` pointing at `PROTOTYPE_URL` from `config/links.js`. No separate `txt` asset; the eyebrow/heading/caption are HTML (see §5).
- **06 Behind the Work**: `06 Behind asset/06 Behind 1 pic{1,2,3,4}.png` — four separate collage PNGs, reused for both the initial state and, under a CSS dark/blur overlay, the second state.
- **07 Wrap Up**: **no runtime image assets.** Semantic HTML/CSS over the CSS gradient/background treatment (see §5).
- **Global**: the back-to-top control is HTML (no image asset). The gradient/background is a CSS treatment, not a shipped image.

## 4. Reference-only mockups (not rendered)

The full-frame flattened mockups live in **`/references/png`** and **`/references/svg`** (18 files each), **not** in `/public/images`. They are used for design QA / diffing against the live build and to read copy/layout when authoring HTML — they are **never** imported by a component and **never** rendered as a runtime screen. Files: `01 Hero`, `02 Why Collections {1,2,3,4,6}`, `03 Current Experience {1,2,3}`, `04 Solution {1,2,3}`, `05 Prototype`, `06 Behind {1,2}`, `07 Wrapup {1,2,3}` (each present as both `.png` and `.svg`).

## 5. Text that must be semantic HTML

No exported asset exists for this content (or it must carry interactive/dynamic state), so it is written as real markup, matched typographically to the reference mockups:

- **02**: all five copy lines — "Why Collection?" and the four narrative statements.
- **03**: the "Current Experience" title, the five step-tracker labels, and all three bullet lines (state 1/2/3 summaries).
- **04**: "Solution 0N" eyebrow, heading, the green checkmark badge label, and the paragraph, for all three solutions.
- **05**: "Prototype" eyebrow and "Click the Mockup, try it by yourself!" heading.
- **06**: "Behind the Work" heading and both paragraphs (initial + revealed).
- **07**: heading, closing paragraph, "Tools:" list, "Quick Link:" list (real `<a>` elements), and the footer line.
- **Global**: "Back to top" control text and its arrow glyph/element.

**Conversely**, text that is already **baked into a runtime PNG** must **not** be re-typed as HTML on top of it: the 03 callout/annotation copy (`…1 txt.png`, and whatever is inside the `2 group*.png` / `3 pic.png` composites), the 04 phone-caption beneath each `pic.png`, the 05 "Tap here to start" caption if it is part of `05 Prototype pic.png`, and all baked copy inside the Hero artwork. See the "Do not duplicate baked-in text" rule in `docs/ASSET_MANIFEST.md`.

## 6. Sections using normal document flow

- **07 Wrap Up** — no pinning, no scroll-progress math at all. Plain stacked HTML, laid out top-to-bottom exactly as the three `07 Wrapup` reference snapshots show at their respective scroll positions. The only JS involved anywhere in this section is the smooth-scroll handler on the Back-to-top click.

## 7. Sections using pinned/sticky scroll stages

- **02 Why Collection** — one `PinnedStage`, continuous scroll-driven typography (no discrete steps).
- **03 Current Experience** — one `PinnedStage`, three discrete crossfade states, header/step-tracker held spatially stable throughout.
- **04 Solutions** — one `PinnedStage`, three discrete states, dark gradient panel held stationary.
- **05 Prototype** — one `PinnedStage` (or a shorter, largely static one, since 05 itself has no internal states to scroll through beyond its entrance).

**01 Hero** is a distinct third pattern, neither normal flow nor a multi-state pinned narrative: a single sticky full-screen card that translates upward and out as the user scrolls into 02. It uses the same `useScrollProgress` primitive as `PinnedStage` internally, but doesn't need `PinnedStage` itself since there's only one state, not several to crossfade between.

**06 Behind the Work** is also distinct: it is scroll-*triggered* (an `IntersectionObserver` firing once when the section becomes meaningfully visible), not scroll-*driven* — its two states are separated by a timer, not by scroll position, and the transition does not reverse on scroll-up (see `useOneShotInView` in §2 and `ANIMATION_SPEC.md`).

## 8. How section transitions are isolated

Two of the specified transitions — **03 → 04** and **04 → 05** — describe one section's content physically exiting while the next section's content physically enters (evidence canvas sliding down as a solution panel slides in from the right; a prototype panel pushing a solution panel off to the right). These read like a single continuous mechanism spanning two sections, which would normally mean fusing 03/04/05 into one mega-component — directly at odds with keeping sections independently editable.

The chosen approach avoids that fusion:

- Each of 03, 04, and 05 remains its **own component with its own `PinnedStage` and its own local scroll-progress instance**. Editing section 04's copy or timing cannot break section 03 or 05's code, because neither reads the others' state.
- The "dark gradient stays stationary" requirement is satisfied by every section independently rendering the **same shared `GradientStage` primitive** — visually seamless because it's the same gradient treatment at the same position with no motion applied, not because it's one shared DOM node. A gradient with zero motion is trivially "stationary" across a section boundary.
- The physical handoff illusion (exit-down/enter-right, push-and-settle) comes from **standard adjacent-sticky-section overlap**: when one `height: {N}vh` track's `position: sticky` inner viewport approaches the end of its own track, it naturally begins scrolling away *while* the next section's sticky viewport is simultaneously becoming pinned, just below it, in the same viewport. Each section only needs to author its own exit keyframes in the last ~15–20% of its own local progress, and the next section its own entrance keyframes in the first ~15–20% of its local progress — the visual overlap emerges from normal document/scroll geometry, not from any cross-component coordination code.
- Because every transition is expressed as `transform`/`opacity` = *pure function of that section's own local scroll progress* (never an imperative "play this animation once" trigger), scrolling backward reverses everything automatically — there is no state machine to un-wind, just the same function evaluated at a smaller progress value. This is the single governing rule for every scroll-*driven* transition in the site (01 exit, 02, 03, 03→04 handoff, 04, 04→05 handoff, 05 entrance). **06 is the sole exception**, by design (see §7).

## 9. Responsive strategy (desktop-primary) — finalized

The Figma frames are authored at `1728×1117` and the pinned/cinematic sections (02–05) assume a wide viewport — side-by-side panels, floating phone mockups with annotation callouts, and typography sized for a large canvas. Desktop is the primary interview-presentation context; the three-tier strategy below is final, not a proposal. No mechanism introduces a new/separate mobile design — every breakpoint renders the same content, assets, copy, and order, only the presentation mechanics adapt.

**Desktop — `≥ 1024px`**
- Full Figma layout at fluid scale (`clamp()`/`vw`-based sizing derived from the 1728px-frame proportions).
- Full pinned/sticky interactions: `PinnedStage` active for 02, 03, 04, 05; Hero's sticky exit active.
- All physical section transitions active exactly as specified in `ANIMATION_SPEC.md` (03→04 exit/enter handoff, 04→05 push-and-settle).

**Tablet — `768px – 1023px`**
- Preserve the same experience where practical: pinning, crossfades, and both handoff transitions **stay active** — this tier does not fall back to normal document flow.
- Spacing and mockup sizing scale down proportionally within the same fluid `clamp()`/`vw` system already used for desktop (no separate tablet layout to author).
- Pinned scroll-track heights (the `{N}vh` distances in `PinnedStage`) may be tuned shorter than desktop's, since less side-by-side room slightly changes reading pace — a tuning parameter, not a mechanism change.
- Easing/timing/keyframe values are unchanged from `ANIMATION_SPEC.md`.

**Mobile — `< 768px`**
- Prioritize readability over preserving the pinned/scroll-hijacking mechanics: `PinnedStage` is disabled for 02, 03, 04, 05, and Hero's sticky exit is disabled. All five render in normal document flow instead, in the same top-to-bottom order, with the same assets and copy — effectively the same treatment already used for Section 07 at every breakpoint.
- The 03→04 exit/enter handoff and the 04→05 physical push transition have no normal-flow equivalent and are not attempted in a simplified form — they are simply absent, since the sections that would participate are already in normal flow at this tier.
- Content that depended on a pinned state for legibility (e.g. 03's three crossfading evidence states, 04's three crossfading solution states) instead renders as three stacked, always-visible groups in reading order, each carrying its own header context (title/step-tracker state, or solution number/heading) inline rather than relying on a spatially-stable shared header — no content is cut, only the crossfade-through-one-viewport mechanism is removed.
- Section 06's one-shot IntersectionObserver + timer reveal is layout-independent and stays active unchanged at this tier.
- Section 07 is already normal flow at every breakpoint and is unaffected.
- Per the global "no generic fade-in everywhere" principle in `ANIMATION_SPEC.md`, the normal-flow sections at this tier do not gain a substitute scroll-triggered animation to replace the removed pinned motion — content simply appears in flow, static, exactly as Section 07 already does.

## 10. Accessibility considerations

- **`prefers-reduced-motion: reduce`** is checked once via `useReducedMotion()` and threaded through every animated primitive. Full behavior-by-behavior fallback table is in `ANIMATION_SPEC.md` — Hero's exit and breathing cue, 02's continuous typography motion, 03/04/05's crossfades and push transitions, 06's auto-transition, and 07's rolling arrow all have a defined reduced-motion substitute rather than being silently left running.
- **Focus and semantics**: the Prototype mockup (05), the Quick Links (07), and Back-to-top (global) are real interactive elements (`<a>`/`<button>`), not `<img>`/`<div>` with click handlers — they get native keyboard focus, visible focus rings, and correct roles for free.
- **Heading hierarchy**: one logical `h1`–`h2` structure across the page (e.g. Hero title as `h1`; each section's title as `h2`) rather than styling divs to look like headings, so the page is navigable via screen-reader heading navigation.
- **Decorative vs. meaningful images**: full-bleed backgrounds and collage assets (Hero, Behind the Work's scattered sketches, all `bg`/`bg2` gradients) are decorative — `alt=""`/`aria-hidden="true"`. Phone mockups and callout cards are illustrative of content already stated in adjacent HTML text (headings/paragraphs/captions), so they follow the same decorative treatment by default; flag for confirmation if any mockup conveys information not present in the surrounding text, in which case it needs a real `alt`.
- **Reduced-motion still needs to be legible**: every "final state" reachable only via animation (the demoted small "Why Collection?" label, 03's active step-tracker state, 06's second state) must also be reachable/visible when motion is disabled — reduced motion means *no continuous/looping motion*, not *missing end states*.

---

## 11. Known cleanup items for the code pass

The Vite/React boilerplate is gone — `src/App.jsx` mounts the seven sections, `src/index.css` holds the `@font-face` (Instagram Sans) declarations + global tokens, and there is no `App.css`. Outstanding items to reconcile the **code** with this document and `docs/ASSET_MANIFEST.md` (docs are now the target; these are stale references still in the code):

- **Stale asset paths (all currently broken against `/public/images`):**
  - `Hero.jsx` renders `img('01 Hero.png', 'references')` (a `/references/…` path — reference-only, and not served from `/public`); it must render `01 Hero asset/01 Hero bg.png` from the runtime tree.
  - `GradientStage`/`FillBackground` fetch the removed `02 Why Collections bg.svg`; replace with the CSS gradient/background treatment.
  - `CurrentExperience.jsx`, `Solutions.jsx`, `Prototype.jsx`, `BehindTheWork.jsx`, and `WrapUp.jsx` reference flat `/images/*.svg` names that no longer exist; repoint them to the nested runtime PNGs (and add the currently-unused State 2/3 assets for 03 and the Solution 2/3 assets for 04).
- **Motion not yet built:** every scroll-driven / timer-driven behavior in `docs/ANIMATION_SPEC.md` is deferred; the `PinnedStage`/`ScrollCue` primitives and the `hooks/` folder do not exist yet.

No application code is changed by this documentation update.
