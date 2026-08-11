import PinnedStage from '../../components/PinnedStage'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { img } from '../../lib/assets'
import { clamp, lerp } from '../../lib/motion'
import styles from './BehindTheWork.module.css'

/**
 * Scroll-driven two-state stage (overrides the older timer-driven §06 note):
 * State 1 stays put underneath; State 2 is only an opacity fade of the dark
 * project-gradient overlay + black scrim + centered statement. Sketches never move.
 *
 * Layer order (matches `references/svg/06 Behind 2`):
 *   collage → multicolor gradient @ 70% → black @ 70% → statement
 */

/** Extra scroll distance after the sticky viewport for the State 1→2 fade. */
const PIN_TRACK_VH = 120

/** Each overlay layer settles at 70% — never fully opaque. */
const OVERLAY_MAX = 0.7

const STATEMENT =
  'Before narrowing the scope, I mapped issues across discovery, creation, sharing, and organization.'

function Collage() {
  return (
    <div className={styles.collage} aria-hidden="true">
      {/* Painted back-to-front in the Figma frame's own stacking order: pic3, pic1,
          pic2, pic4 — each sheet overlaps the one before it. */}
      <img className={styles.pic3} src={img('06 Behind asset/06 Behind 1 pic3.png')} alt="" />
      <img className={styles.pic1} src={img('06 Behind asset/06 Behind 1 pic1.png')} alt="" />
      <img className={styles.pic2} src={img('06 Behind asset/06 Behind 1 pic2.png')} alt="" />
      <img className={styles.pic4} src={img('06 Behind asset/06 Behind 1 pic4.png')} alt="" />
    </div>
  )
}

function State1Copy() {
  return (
    <div className={styles.text}>
      <h2 className={styles.eyebrow}>Behind the Work</h2>
      <p className={styles.paragraph}>The clean flow started on messy pages…</p>
    </div>
  )
}

/** Gradient then black — two separate 70% layers, not a single GradientStage. */
function State2Overlays({ opacity }) {
  return (
    <>
      <div
        className={styles.overlayGradient}
        style={{ opacity }}
        aria-hidden="true"
      />
      <div
        className={styles.overlayBlack}
        style={{ opacity }}
        aria-hidden="true"
      />
    </>
  )
}

function BehindTheWork() {
  const reduced = useReducedMotion()

  return (
    <PinnedStage
      className={styles.section}
      ariaLabel="Behind the Work"
      height={`calc(100vh + ${PIN_TRACK_VH}vh)`}
      startOffsetVh={0}
    >
      {({ progress, isPinned }) => {
        if (!isPinned) {
          // Mobile: pin disabled — show the reachable end state (overlay + statement).
          return <StaticEndState />
        }

        const p = clamp(progress, 0, 1)
        // Reduced motion: scroll still drives the state, but as a single step at mid-track.
        const t = reduced ? (p >= 0.5 ? 1 : 0) : p
        const overlayOpacity = lerp(0, OVERLAY_MAX, t)
        const statementOpacity = t

        return (
          <>
            <Collage />
            <State1Copy />
            <State2Overlays opacity={overlayOpacity} />
            <p
              className={styles.statement}
              style={{ opacity: statementOpacity }}
            >
              {STATEMENT}
            </p>
          </>
        )
      }}
    </PinnedStage>
  )
}

/** Mobile / unpinned: State 2 fully visible over the unchanged collage. */
function StaticEndState() {
  return (
    <>
      <Collage />
      <State1Copy />
      <State2Overlays opacity={OVERLAY_MAX} />
      <p className={styles.statement} style={{ opacity: 1 }}>
        {STATEMENT}
      </p>
    </>
  )
}

export default BehindTheWork
