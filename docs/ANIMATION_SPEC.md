# Animation Spec — Instagram Collection Redesign Case-Study Site

Exact interaction/motion behavior for each section. This formalizes the interaction direction into concrete timing, easing, and implementation technique. No visual redesign — motion only. Cross-reference: `docs/ASSET_MANIFEST.md` (what's an asset vs. HTML) and `docs/ARCHITECTURE.md` (which component/primitive owns each behavior).

**Governing rule, all sections**: every scroll-*driven* transition (01 exit, 02, 03, 03→04, 04, 04→05, 05 entrance) is expressed as `transform`/`opacity` = a pure function of that element's own local scroll progress (`0–1`). Nothing is triggered and played once — reversal on scroll-up is automatic because the function is simply evaluated at a smaller input, not because any reverse logic was written. **Section 06 is the one deliberate exception**: it is scroll-*triggered*, timer-driven, and explicitly one-way/non-reversible (see §06).

---

## 01 · Hero

**Static content**: the entire `01 Hero asset/01 Hero bg.png` artwork is motionless. It is one complete flattened image — no individual element inside it (cards, title, badges) animates independently, and it is never rebuilt from separate pieces.

**"Scroll down to continue" cue**
- CSS `@keyframes` opacity breathing loop, applied to the scroll-cue element only. *Asset note:* there is **no** separate `⇣ Scroll down to continue.png` in `public/images` — the cue is either baked into the Hero artwork or, if a live breathing cue is wanted, it is a small **HTML/CSS overlay element** (not a shipped image). The breathing motion below is unchanged either way.
- Cycle: `opacity: 1 → 0.35 → 1`.
- Duration: **~4s per cycle**, `ease-in-out`, `infinite`.
- No transform, no scale — opacity only.

**Hero exit (scroll into Section 02)**
- Hero is a `position: sticky; top: 0; height: 100vh` full-screen card sitting in front of a short scroll track (enough extra scroll distance, e.g. ~50–75vh, to give the exit a deliberate but not sluggish feel).
- As local scroll progress goes `0 → 1` across that track, the whole card's `transform: translateY(...)` moves from `0` to `-100vh`. Nothing inside the card gets its own transform — the card is one rigid unit.
- Easing: linear-with-scroll (the transform is a direct function of scroll progress, not a timed easing curve) — this is what makes it feel physically "pinned to the scrollbar" rather than an animation playing on its own.
- Once progress reaches 1, Hero is fully off-screen and Section 02 owns the viewport.

**Reduced motion**: breathing cue becomes static (`opacity: 1`, animation removed). Hero exit keeps its scroll-driven translate (it's simple, linear, and directly tied to scroll input rather than a self-running animation, so it does not need to be suppressed) — if stricter compliance is wanted, the translate can be swapped for an instant step at progress ≥ 0.5 instead of continuous movement; default is to keep the direct scroll-coupling since `prefers-reduced-motion` targets autoplaying/parallax-style motion, not user-driven scroll position mapping.

---

## 02 · Why Collection — cinematic scroll-driven typography

**This is the one continuous-interpolation scrollytelling section on the site.** No IntersectionObserver fade-ins, no swapping of the numbered snapshots (the `references/png|svg/02 Why Collections 1–4` and `…6` files are reference-only per `ASSET_MANIFEST.md`, and Section 02 has **no runtime image assets** at all) — every value below is computed each frame from local scroll progress `p ∈ [0,1]` inside one `PinnedStage`.

**Content states** (5 total): Heading (`Why Collection?`), Statement 1, Statement 2, Statement 3, Statement 4 (the four narrative lines from the brief, in order).

**Relay model**: at any given `p`, at most two narrative statements are visible at once — the current one (large/bright) and the immediately-preceding one (small/dimmed, still finishing its exit upward). The heading is the one exception: after its own demotion, it does **not** continue fading away — it settles permanently into the small upper-left label position (matching the small-label state shown in the `references/.../02 Why Collections` snapshots) and stays there, unchanging, for the rest of the section.

**Default progress allocation** (tunable, but this is the concrete default to build against):

| Range of `p` | Heading | Stmt 1 | Stmt 2 | Stmt 3 | Stmt 4 |
|---|---|---|---|---|---|
| 0.00 – 0.08 | large, centered, bright (hold) | — | — | — | — |
| 0.08 – 0.15 | shrinking + moving to upper-left | — | — | — | — |
| 0.15 – 0.20 | small label (settled) | entering (rise + grow + brighten) | — | — | — |
| 0.20 – 0.35 | small label | large/bright (hold) | — | — | — |
| 0.35 – 0.40 | small label | exiting (rise further + shrink + fade) | entering | — | — |
| 0.40 – 0.55 | small label | gone | large/bright (hold) | — | — |
| 0.55 – 0.60 | small label | — | exiting | entering | — |
| 0.60 – 0.75 | small label | — | gone | large/bright (hold) | — |
| 0.75 – 0.80 | small label | — | — | exiting | entering |
| 0.80 – 1.00 | small label | — | — | gone | large/bright (hold) |

**Per-statement transform, during its own entering/exiting window** (interpolated continuously with `p`, not stepped):
- Position: `translateY(24px → 0)` on entrance (rising from below); `translateY(0 → -24px)` on exit (continuing to rise as it shrinks/fades).
- Scale / font-size: interpolates `0.7× → 1×` on entrance; `1× → 0.85×` on exit (shrink, not disappear-in-place).
- Opacity: `0 → 1` on entrance; `1 → 0.35 → 0` on exit (dims first, matching the reference's dimmed-but-still-legible intermediate look, then clears).
- Easing: `ease-out` for entrances (fast rise, settle), `ease-in` for exits.

**Heading's unique path**: entrance is identical to the pattern above (large, centered) for `0.00–0.08`; its "exit" (`0.08–0.15`) is a one-time move to a fixed small-label transform (translate to upper-left position + scale to label size + no further opacity change) that then **holds indefinitely** — it is not re-evaluated per statement transition after that point.

**Reduced motion**: replace all continuous `translateY`/`scale` interpolation with a straight `opacity` crossfade between whichever statement is "current" for a given `p` (heading still settles to its small label, since that's an end state, not a looping motion) — no rising/shrinking motion, just fade.

---

## 03 · Current Experience

**Spatially stable header**, held fixed within the pinned viewport for the entire section: "Current Experience" title + the step tracker. Local progress `p ∈ [0,1]` split into three roughly-equal thirds (with ~15% overlap zones at each boundary for the crossfade, per the isolation strategy in `ARCHITECTURE.md` §8):

| `p` range | Active state | Bright steps | Connector style | Bullet copy |
|---|---|---|---|---|
| 0.00 – 0.30 | State 1 | Discover, Save | dotted between Save → Create (visualizing the gap) | "Users lose a familiar saving action when moving from feed to detail." |
| 0.30 – 0.65 | State 2 | Create, Collaborate | solid | "The creation flow is easily blocked, and collaboration is limited to one friend." |
| 0.65 – 1.00 | State 3 | Manage | solid | "Once a Collection is created, users cannot add or manage collaborators later." |

**Evidence canvas** (the light panel holding the phone mockups + callout cards): stays spatially consistent (same position/size) across all three states. Only its *contents* change:
- Outgoing state's mockups/callouts: `opacity 1 → 0`, `translateY(0 → -12px)` (subtle upward drift, restrained — not a slide-out).
- Incoming state's mockups/callouts: `opacity 0 → 1`, `translateY(12px → 0)`.
- Crossfade duration mapped to the ~15% overlap zone at each boundary; `ease-in-out`.
- Step-tracker bold/grey state and bullet copy swap on the same overlap window (a simple `opacity` crossfade on the bullet text; step-tracker weight/color interpolates or swaps at the overlap midpoint — no bounce).

**Explicitly avoided**: three stacked full-page layouts. All three states render inside the one pinned viewport; only their evidence content and header state differ.

**Reduced motion**: crossfades keep opacity-only (already true above), just remove the `translateY` drift component.

---

## 03 → 04 transition

Boundary handoff between two independently-authored `PinnedStage`s (see `ARCHITECTURE.md` §8) — not a shared component.

- **Section 03's tail** (its own local `p` in ~0.85–1.0, i.e. after State 3 has held): evidence canvas `translateY(0 → 40vh)` + `opacity(1 → 0)`, moving down and out.
- **Section 04's head** (its own local `p` in ~0.0–0.15): first Solution light panel `translateX(100% → 0)`, entering from the right.
- **Dark gradient background**: rendered by both sections via the shared `GradientStage` primitive with zero motion applied — visually stationary through the handoff because neither section ever transforms it.
- **Easing**: a restrained spring/overshoot curve, e.g. `cubic-bezier(0.34, 1.2, 0.64, 1)` (slight overshoot, no exaggerated bounce) — tune the middle control points down further if the overshoot reads as too playful; the intent is a small settle-past-and-back, not a bounce cycle.
- **Reversal**: automatic — both keyframe sets are pure functions of their own section's local `p`; scrolling up simply re-evaluates them at smaller values.

---

## 04 · Solutions

One pinned stage, three states (mirrors 03's mechanism):

| State | Left column | Right panel contents |
|---|---|---|
| Solution 01 | "Solution 01" / "Reels Detail Enhancement" / "Interface Consistency" + explanation | `04 Solution 1 pic.png` |
| Solution 02 | "Solution 02" / "New Collection Enhancement" / "Multi-User Collaboration" + explanation | `04 Solution 2 pic.png` |
| Solution 03 | "Solution 03" / "Manage Collection Enhancement" / "Collaboration Consistency" + explanation | `04 Solution 3 pic.png` |

*Asset note:* the right panel is a single runtime PNG per state (`04 Solution asset/04 Solution N pic.png`); there is **no** separate `txt` caption asset — any caption is baked into the `pic.png`, and the left-column copy (eyebrow/heading/badge/explanation) is HTML.

- Local `p` split into three thirds, same restrained-crossfade mechanism as §03 (opacity + small `translateY`/`translateX` drift on the right panel's mockup, no bounce).
- Left column text content swaps via opacity crossfade only (text shouldn't slide — it's reading content, not evidence).
- Dark gradient panel background stationary throughout (same `GradientStage` instance for the section, no transform).
- **Explicitly avoided**: three stacked full-page Solution screens.

**Reduced motion**: opacity-only crossfades, no drift.

---

## 04 → 05 transition — physical push, not crossfade

This is the one transition where two panels are simultaneously visible and treated as physical objects, not fading layers.

- Both the outgoing Solution light panel and the incoming Prototype light panel are positioned in the same track and driven by **one shared local progress value** for this handoff window (e.g. the last ~20% of Section 04's `p` and/or the first ~20% of Section 05's `p`, split at the section boundary as in §03→04).
- Prototype panel: `translateX(-100% → 0)`, entering from the left.
- Solution panel: `translateX(0 → 100%)`, pushed out to the right — driven by the *same* progress input as the Prototype panel's entrance, not an independent timer, so the two motions stay physically locked together (as one panel advances, the other retreats by the corresponding amount).
- At `p ≈ 0.5` of this handoff window: both panels roughly half-onscreen, side by side — the literal "both visible mid-transition" moment.
- Dark gradient background stationary (same `GradientStage`, no transform), same as §03→04.
- Easing: linear-with-scroll for the push itself (it should feel like scroll position *is* the push distance, reinforcing the "physical object" read), not a timed curve — the "physical" quality comes from direct 1:1 scroll coupling, not from easing.
- **Reversal**: automatic, same progress-function principle — scrolling back up retracts the Prototype panel left and slides the Solution panel back to center.
- **Explicitly avoided**: crossfade/opacity-based handoff between the two panels.

---

## 05 · Prototype

Visually quiet — no section-internal states to scroll through beyond the entrance handoff in §04→05.

- Left: light panel with `05 Prototype asset/05 Prototype pic.png`. Right: dark gradient panel with "Prototype" eyebrow + "Click the Mockup, try it by yourself!" heading (HTML).
- **Link source of truth**: the Figma prototype URL is stored once, as `PROTOTYPE_URL`, in `src/config/links.js`:
  ```js
  export const PROTOTYPE_URL =
    'https://www.figma.com/proto/Fk7uatF6NZBenD9BwYl6y4/TT-Prototype?node-id=2054-8108&p=f&viewport=-805%2C-839%2C0.54&t=VGFwMyGygk3wcdKE-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=2054%3A8108&page-id=2054%3A6564'
  ```
  `Prototype.jsx` imports this constant; the URL string is not duplicated or re-typed anywhere else in the codebase.
- **Mockup interactivity** — the mockup image (`05 Prototype pic.png`) is the *only* clickable target in this section, wrapped in a real `<a href={PROTOTYPE_URL}>`:
  - **Hover**: `cursor: pointer`; `transform: scale(1.015)` (extremely subtle — not the same magnitude as a card-hover pattern); `box-shadow`/elevation increases slightly. Transition ~150–200ms `ease-out`.
  - **Click**: opens `PROTOTYPE_URL` in a new tab — `target="_blank" rel="noopener noreferrer"` (the `rel` attributes are required, not optional, since a `target="_blank"` link without them can let the opened page control the originating tab).
- **"Tap here to start"** remains **instructional text only** — it is not itself wrapped in a link and has no independent click handler; it sits beside the mockup to point at the one interactive element, and is otherwise inert. *Asset note:* there is **no** `05 Prototype txt.svg` runtime asset — this caption is HTML (or already baked into `05 Prototype pic.png`, in which case it is not duplicated as HTML).
- **No additional CTA button** is added beyond the mockup itself being the click target, per direction.

**Reduced motion**: hover scale/elevation removed or reduced to a negligible amount (e.g. box-shadow change only, no transform) — click behavior unaffected.

---

## 06 · Behind the Work — one-shot, timer-driven (not scroll-driven)

The one section whose motion is *triggered*, not a function of continuous scroll position, and which is explicitly non-reversible by design.

**Mechanism**
1. `IntersectionObserver` watches the section root; fires when "meaningfully visible" (e.g. `threshold: 0.5`).
2. On first firing only, start a `2s` timer.
3. When the timer elapses, play the transition **once**:
   - Same underlying `06 Behind asset/06 Behind 1 pic1–4.png` composition stays in place (no new assets, no re-layout).
   - Dark project-gradient overlay fades in over the collage: `opacity 0 → ~0.85`, `~800ms–1000ms ease-in-out`.
   - Sketch contrast reduces slightly in the same window (CSS `filter: contrast(...)`/`brightness(...)` tween, subtle — the sketches should stay legible, just recede).
   - Centered text ("Before narrowing the scope, I mapped issues across discovery, creation, sharing, and organization.") fades in: `opacity 0 → 1`, slightly staggered after the overlay begins (~150–200ms delay) so it reads as "overlay arrives, then text appears on it," not simultaneous.
4. A `hasPlayed` latch (component state, set permanently `true` once the transition completes) guards the whole thing:
   - Never plays again, even if the section leaves and re-enters the viewport.
   - Scrolling back up **does not revert** to the first state — State 2 remains visible, per direction. This is intentionally the opposite of every other section's reversibility rule.
   - The latch lives in component state for the lifetime of the page session (this is a single continuous-scroll SPA with no route changes, so the component never unmounts — plain `useState`/`useRef` is sufficient; no `sessionStorage` needed).

**No click, no additional scroll required** to trigger — visibility + dwell time only.

**Reduced motion**: keep the 2s dwell + one-shot trigger (it's not a looping/parallax effect, it's a single state change), but drop to a simple, fast opacity crossfade for the overlay/text and skip the contrast tween — still one-way, still permanent.

---

## 07 · Wrap Up — normal scroll, no pinning, no cinematic typography

No scroll listeners of any kind drive this section's layout or content — it is stacked HTML in normal document flow, matching the three `07 Wrapup` reference snapshots as static positions on the page (not animation states).

**Quick Links**
- Real `<a href="...">` elements (`Figma Prototype`, `Github`, `Vercel`) — not buttons, not `<div>`s with click handlers.
- Hover: `font-weight` increases (e.g. 400/500 → 600–700). No color or underline change beyond what the reference shows.
- External links: `target="_blank" rel="noopener noreferrer"` where appropriate.

**Back to top**
- "Back to top" text is completely static — never animates.
- Only the `⇡` arrow element animates, as a continuous **upward conveyor loop**, not a bounce:
  - Implementation: two stacked copies of the arrow glyph inside a clipped/fixed-height container, each animating `translateY(0 → -100%)` + `opacity(1 → 0)` over the same duration, with the second copy's `animation-delay` offset by 50% of that duration (and starting at `translateY(100%)`, `opacity: 0 → 1` as it rises into position) — the classic two-copy ticker technique, so there is no visible reset/pop, just continuous upward motion.
  - Suggested cycle: ~1.6–2s per arrow, linear or gentle `ease-in-out` (no elastic/bounce easing — direction explicitly rules out a bouncing arrow).
- **Click**: smooth-scrolls the page back to the **Hero** section specifically (not merely to `scrollTop: 0` in a generic sense — the scroll target is Hero's element), via `element.scrollIntoView({ behavior: 'smooth' })` or an equivalent scroll-to-element utility.

**Reduced motion**: arrow conveyor loop stops, rendered as a single static `⇡`. Quick-link hover weight change and the smooth-scroll click both stay (neither is the kind of motion `prefers-reduced-motion` targets — smooth-scroll specifically should still respect the OS preference by falling back to instant `scrollIntoView({ behavior: 'auto' })`).

---

## Responsive motion behavior (finalized breakpoints)

Breakpoint mechanics are defined in `ARCHITECTURE.md` §9; this is how each section's motion above maps onto them. No section gains a new/different animation design per breakpoint — only whether the scroll-driven mechanism is active changes.

| Section | Desktop `≥1024px` | Tablet `768–1023px` | Mobile `<768px` |
|---|---|---|---|
| 01 Hero | Full spec above (breathing cue + sticky scroll-exit) | Unchanged | Breathing cue unchanged (opacity-only, cheap at any size); sticky scroll-exit **disabled** — Hero sits in normal flow and is simply scrolled past |
| 02 Why Collection | Full continuous-interpolation relay | Unchanged, track height may be tuned shorter | `PinnedStage` **disabled** — heading and all four statements render stacked, static, in normal flow, in reading order (no rise/shrink/fade motion, no relay) |
| 03 Current Experience | Full pinned 3-state crossfade, stable header | Unchanged, track height may be tuned shorter | `PinnedStage` **disabled** — the three states render as three stacked static groups in order, each carrying its own header line (title/active-steps/bullet) inline rather than one shared stable header |
| 03→04 transition | Full exit-down/enter-right handoff with spring/overshoot | Unchanged | **Not applicable** — both sections are in normal flow; no handoff motion |
| 04 Solutions | Full pinned 3-state crossfade, stationary dark panel | Unchanged, track height may be tuned shorter | `PinnedStage` **disabled** — three stacked static groups (number/heading/badge/explanation + mockup), same content, no crossfade |
| 04→05 transition | Full physical push (both panels driven by one shared progress value) | Unchanged | **Not applicable** — no handoff motion in normal flow |
| 05 Prototype | Full hover scale/elevation + click-through | Unchanged | Hover states harmless but largely moot on touch; click-through behavior unchanged (tap opens `PROTOTYPE_URL` in a new tab) |
| 06 Behind the Work | Full one-shot IntersectionObserver + 2s dwell reveal | Unchanged | Unchanged — layout-independent, not tied to pinning |
| 07 Wrap Up | Normal flow, hover weight change, rolling arrow, smooth-scroll-to-Hero | Unchanged | Unchanged — already normal flow at every breakpoint |

At the mobile tier, sections that lose their pinned crossfade do **not** receive a substitute scroll-triggered fade-in/slide-in to compensate — per the "no generic fade-in everywhere" principle below, content simply appears in normal document flow, static, the same way Section 07 already behaves at every breakpoint.

---

## Global motion principles

- Motion exists only to communicate **narrative hierarchy and stage changes** — never decoration.
- **Not present anywhere in this spec, and not to be added**: parallax, floating/independently-drifting cards, mouse-follow effects, decorative motion, exaggerated bounce, or generic scroll-triggered fade-ins applied indiscriminately.
- Every scroll-*driven* transition is reversible on scroll-up by construction (pure function of scroll progress — see the governing rule at the top of this document). Section 06 is the sole, deliberate, documented exception.
- `prefers-reduced-motion: reduce` fallback is specified per section above; the summary:

| Section | Reduced-motion behavior |
|---|---|
| 01 Hero | Breathing cue → static opacity; scroll-exit keeps direct scroll coupling |
| 02 Why Collection | Rising/shrinking motion → opacity-only crossfade; heading's small-label end state unchanged |
| 03 Current Experience | Drop the `translateY` drift; keep opacity crossfade |
| 03→04 / 04→05 transitions | Same handoff, spring/overshoot easing swapped for a simple linear or ease-in-out (no overshoot) |
| 04 Solutions | Drop drift; keep opacity crossfade |
| 05 Prototype | Hover scale/elevation minimized or removed; click behavior unchanged |
| 06 Behind the Work | Keep the one-shot timer trigger; simplify overlay/text to a fast opacity crossfade, drop the contrast tween |
| 07 Wrap Up | Arrow conveyor loop stops (static arrow); smooth-scroll falls back to instant jump |

The Figma assets and `docs/ASSET_MANIFEST.md` remain the visual source of truth; this document governs motion/timing only.
