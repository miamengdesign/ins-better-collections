# Architecture — Instagram Collection Redesign Case-Study Site

Implementation architecture for assembling the seven sections from the assets catalogued in `docs/ASSET_MANIFEST.md`. This document describes structure and mechanism only — no layout, copy, or visual design decisions are made here; everything defers to the Figma exports and reference mockups.

No application code has been written yet. This is the plan to build against.

---

## 1. React component structure

One top-level component per section, mounted once, in document order, by `App.jsx`. Each section is a self-contained folder: its own component, its own local styles, and (where needed) its own local scroll-progress hook instance. Nothing about a section's internals is imported by another section.

```
src/
  App.jsx                        — mounts the 7 sections in order + <BackToTop/>
  sections/
    01-hero/
      Hero.jsx
      Hero.module.css
    02-why-collection/
      WhyCollection.jsx
      WhyCollection.module.css
    03-current-experience/
      CurrentExperience.jsx
      CurrentExperience.module.css
    04-solutions/
      Solutions.jsx
      Solutions.module.css
    05-prototype/
      Prototype.jsx
      Prototype.module.css
    06-behind-the-work/
      BehindTheWork.jsx
      BehindTheWork.module.css
    07-wrap-up/
      WrapUp.jsx
      WrapUp.module.css
  components/                    — shared primitives, see §2
    PinnedStage.jsx
    GradientStage.jsx
    StepTracker.jsx
    PhoneMockup.jsx
    CalloutCard.jsx
    BackToTop.jsx
    ScrollCue.jsx
  hooks/
    useScrollProgress.js
    useReducedMotion.js
    useOneShotInView.js
```

`App.jsx` is a thin shell: it renders `<Hero/> <WhyCollection/> <CurrentExperience/> <Solutions/> <Prototype/> <BehindTheWork/> <WrapUp/> <BackToTop/>` and nothing else. It holds no shared scroll state — each section computes its own progress locally (see §8).

---

## 2. Shared components and layout primitives

| Primitive | Used by | Responsibility |
|---|---|---|
| `PinnedStage` | 02, 03, 04, 05 | The `height:{N}vh` scroll-track + inner `position: sticky; top:0; height:100vh` wrapper. Exposes local scroll progress `0–1` to its children via a render prop. This is the *only* place scroll-hijacking/pinning mechanics live — sections consume it, they don't reimplement it. |
| `GradientStage` | 02, 03 (header strip), 04 (dark panel), 05 (dark panel), 07 (page background) | Renders the shared rainbow-gradient asset (`02 Why Collections bg.svg`) as a full-bleed backdrop. One component, one asset reference, so the gradient is visually and pixel-identical everywhere it appears instead of five copy-pasted backgrounds. |
| `StepTracker` | 03 only | `Discover → Save → Create → Collaborate → Manage`, taking an `activeSteps` prop (e.g. `['Discover','Save']`) to control bold/grey state and the dotted-vs-solid connector between Save and Create. Factored out because it's stateful, reused across 03's three internal states, and non-trivial enough to warrant its own file even though only one section uses it. |
| `PhoneMockup` | 03, 04, 05 | Thin wrapper around a `pic*.svg` asset — consistent sizing, drop-shadow, and the enter/exit animation hook-up, so each section doesn't re-derive mockup presentation from scratch. |
| `CalloutCard` | 03 only | Thin wrapper around a `txt*.svg` annotation asset (renders it, positions it, wires its independent fade/slide-in). |
| `BackToTop` | global (rendered once in `App.jsx`, fixed/footer-positioned near section 07) | The rolling-arrow control; owns its own CSS loop animation and the smooth-scroll-to-Hero click handler. |
| `ScrollCue` | 01 only | The breathing-opacity "Scroll down to continue" hint. Small enough to stay local to Hero rather than shared, but listed here since it's a self-contained animated unit. |
| `useScrollProgress(ref, opts)` | `PinnedStage`, and any section needing scroll-linked values without full pinning (e.g. Hero's exit) | Returns a `0–1` number derived from the element's position in the viewport. Pure function of scroll position — no internal animation state, which is what makes every scroll-linked transition reversible for free (see §8). |
| `useReducedMotion()` | every animated component | Wraps `matchMedia('(prefers-reduced-motion: reduce)')`; components branch their animation logic on this, not on ad hoc checks scattered per file. |
| `useOneShotInView(ref, {threshold, delay})` | 06 only | IntersectionObserver + a delay timer + a latch (`hasPlayed`) that never resets. The one deliberately non-reversible, imperative piece of motion logic in the site — isolated to its own hook so it's obviously the exception, not the pattern. |

---

## 3. Runtime assets per section

(Full detail and reasoning in `docs/ASSET_MANIFEST.md`; this is the consumption summary.)

- **01 Hero**: `01 Hero bg.svg` (single static full-screen visual) + `⇣ Scroll down to continue.png`.
- **02 Why Collection**: `02 Why Collections bg.svg` only. All five copy lines are HTML (see §5).
- **03 Current Experience**: `03 Current Experience {1,2,3} pic*.svg` (6 phone mockups total) + `03 Current Experience {1,2,3} txt*.svg` (5 callout cards total). The shell/header background is HTML+CSS informed by `03 Current Experience 1 bg.svg`, not the asset itself (see §5).
- **04 Solutions**: `04 Solution bg.svg` (shared) + `04 Solution {1,2,3} pic.svg` + `04 Solution {1,2,3} txt.svg` (small caption+icon assets).
- **05 Prototype**: `05 Prototype bg.svg` + `05 Prototype pic.svg` (the clickable mockup) + `05 Prototype txt.svg`.
- **06 Behind the Work**: `06 Behind 1 pic{1,2,3,4}.svg` (reused for both the initial state and, under a CSS dark/blur overlay, the second state).
- **07 Wrap Up**: the shared gradient via `GradientStage` (reusing `02 Why Collections bg.svg`) as page background only.
- **Global**: `⇡ Back to top.svg` is reference-only for type styling (see §5); the rendered control is HTML.

## 4. Reference-only full-frame SVGs (not rendered)

`01 Hero.svg`, `01 Hero.png`, all `02 Why Collections 1–5.svg`, `02 Why Collections bg2.svg`, `02 Why Collections bg.png`, `03 Current Experience 1 bg.svg` (text/state portion only — see §5), all three `03 Current Experience {1,2,3}.svg` composites, all three `04 Solution {1,2,3}.svg` composites, `05 Prototype.svg`, `06 Behind 1.svg`, `06 Behind 2.svg`, and all three `07 Wrapup 1–3.svg`. These stay in `/public/images` for design QA/diffing against the live build but are never imported by a component.

## 5. Text that must be semantic HTML

No exported asset exists for this content (or it must carry interactive/dynamic state), so it is written as real markup, matched typographically to the reference mockups:

- **02**: all five copy lines — "Why Collection?" and the four narrative statements.
- **03**: the "Current Experience" title, the five step-tracker labels, and all three bullet lines (state 1/2/3 summaries).
- **04**: "Solution 0N" eyebrow, heading, the green checkmark badge label, and the paragraph, for all three solutions.
- **05**: "Prototype" eyebrow and "Click the Mockup, try it by yourself!" heading.
- **06**: "Behind the Work" heading and both paragraphs (initial + revealed).
- **07**: heading, closing paragraph, "Tools:" list, "Quick Link:" list (real `<a>` elements), and the footer line.
- **Global**: "Back to top" control text and its arrow glyph/element.

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
- The "dark gradient stays stationary" requirement is satisfied by every section independently rendering the **same shared `GradientStage` primitive** — visually seamless because it's the same asset at the same position with no motion applied, not because it's one shared DOM node. A gradient with zero motion is trivially "stationary" across a section boundary.
- The physical handoff illusion (exit-down/enter-right, push-and-settle) comes from **standard adjacent-sticky-section overlap**: when one `height: {N}vh` track's `position: sticky` inner viewport approaches the end of its own track, it naturally begins scrolling away *while* the next section's sticky viewport is simultaneously becoming pinned, just below it, in the same viewport. Each section only needs to author its own exit keyframes in the last ~15–20% of its own local progress, and the next section its own entrance keyframes in the first ~15–20% of its local progress — the visual overlap emerges from normal document/scroll geometry, not from any cross-component coordination code.
- Because every transition is expressed as `transform`/`opacity` = *pure function of that section's own local scroll progress* (never an imperative "play this animation once" trigger), scrolling backward reverses everything automatically — there is no state machine to un-wind, just the same function evaluated at a smaller progress value. This is the single governing rule for every scroll-*driven* transition in the site (01 exit, 02, 03, 03→04 handoff, 04, 04→05 handoff, 05 entrance). **06 is the sole exception**, by design (see §7).

## 9. Responsive strategy (desktop-primary)

The Figma frames are authored at `1728×1117` and the pinned/cinematic sections (02–05) assume a wide viewport — side-by-side panels, floating phone mockups with annotation callouts, and typography sized for a large canvas. Since this build's primary use case is a desktop interview presentation:

- **Desktop (≈1024px and up)**: fluid scaling of the 1728px-frame layout down to the viewport width (`clamp()`/`vw`-based sizing derived from the original frame proportions), preserving the exact composition from the references at any desktop width.
- **Below ≈1024px**: the pinned/cinematic mechanics (02–05, and Hero's sticky exit) are proposed to degrade to normal document flow — same assets, same copy, same order, stacked vertically, with pinning/scroll-hijacking disabled — rather than attempting to force a wide, multi-panel, scroll-scrubbed narrative into a phone-width viewport. This is a mechanism change, not a redesign: no new content, layout, or decoration is introduced, only the removal of pinning below the breakpoint.
- This mobile-degradation strategy is a **proposal, not a decision** — flagging it explicitly since the brief names desktop as the primary presentation context and doesn't specify mobile behavior. Confirm before implementation.

## 10. Accessibility considerations

- **`prefers-reduced-motion: reduce`** is checked once via `useReducedMotion()` and threaded through every animated primitive. Full behavior-by-behavior fallback table is in `ANIMATION_SPEC.md` — Hero's exit and breathing cue, 02's continuous typography motion, 03/04/05's crossfades and push transitions, 06's auto-transition, and 07's rolling arrow all have a defined reduced-motion substitute rather than being silently left running.
- **Focus and semantics**: the Prototype mockup (05), the Quick Links (07), and Back-to-top (global) are real interactive elements (`<a>`/`<button>`), not `<img>`/`<div>` with click handlers — they get native keyboard focus, visible focus rings, and correct roles for free.
- **Heading hierarchy**: one logical `h1`–`h2` structure across the page (e.g. Hero title as `h1`; each section's title as `h2`) rather than styling divs to look like headings, so the page is navigable via screen-reader heading navigation.
- **Decorative vs. meaningful images**: full-bleed backgrounds and collage assets (Hero, Behind the Work's scattered sketches, all `bg`/`bg2` gradients) are decorative — `alt=""`/`aria-hidden="true"`. Phone mockups and callout cards are illustrative of content already stated in adjacent HTML text (headings/paragraphs/captions), so they follow the same decorative treatment by default; flag for confirmation if any mockup conveys information not present in the surrounding text, in which case it needs a real `alt`.
- **Reduced-motion still needs to be legible**: every "final state" reachable only via animation (the demoted small "Why Collection?" label, 03's active step-tracker state, 06's second state) must also be reachable/visible when motion is disabled — reduced motion means *no continuous/looping motion*, not *missing end states*.

---

## Known cleanup item (not part of this task)

The current `src/App.jsx`, `App.css`, and `index.css` are the unmodified `create-vite` template (fixed `1126px` `#root` width, centered text, demo counter button, Vite/React boilerplate markup). None of it is used by the architecture above. Flagging for when application code work begins — no action taken now.
