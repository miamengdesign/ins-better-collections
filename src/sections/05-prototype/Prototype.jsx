import GradientStage from '../../components/GradientStage'
import PinnedStage from '../../components/PinnedStage'
import { PROTOTYPE_URL } from '../../config/links'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { img } from '../../lib/assets'
import { clamp, lerp, rangeProgress } from '../../lib/motion'
import styles from './Prototype.module.css'

/**
 * Short pinned stage: only the §04→05 light-panel push entrance, then a quiet
 * hold. The mockup is the sole clickable target (PROTOTYPE_URL).
 *
 * "Tap here to start" lives in the mockup artwork as instructional text only —
 * it is not a second link or CTA.
 */

/** Shared push window with Section 04’s exit — linear-with-scroll. */
const ENTER = [0, 0.2]

/**
 * Overlap under Solutions so both light panels share the viewport mid-push.
 * Must stay in lockstep with Solutions’ OVERLAP_WITH_05 / PUSH start.
 */
const OVERLAP_VH = 160
const PIN_TRACK_VH = 240

function panelEnterX(p) {
  if (p >= ENTER[1]) return 0
  const t = rangeProgress(p, ENTER[0], ENTER[1])
  return lerp(-100, 0, t)
}

function Prototype() {
  const reduced = useReducedMotion()

  return (
    <PinnedStage
      className={styles.section}
      ariaLabel="Prototype"
      height={`calc(${OVERLAP_VH}vh + ${PIN_TRACK_VH}vh)`}
      overlapVh={OVERLAP_VH}
      startOffsetVh={0}
      style={{ zIndex: 3 }}
    >
      {({ progress, isPinned }) => {
        const p = isPinned ? clamp(progress, 0, 1) : 1
        const x = isPinned ? panelEnterX(p) : 0
        // During the push, keep this stage’s gradient clear so Solutions’
        // stationary GradientStage + exiting panel stay visible underneath.
        // The two gradients are identical, so swapping to opaque at ENTER end
        // is visually a no-op once Solutions has been pushed off.
        const gradientOpacity = !isPinned || p >= ENTER[1] ? 1 : 0

        return (
          <>
            <div className={styles.gradientSlot} style={{ opacity: gradientOpacity }}>
              <GradientStage />
            </div>

            <div
              className={styles.panel}
              style={{ transform: `translateX(${x}%)` }}
            >
              <div className={styles.mockup}>
                <a
                  className={`${styles.link} ${reduced ? styles.linkReduced : ''}`}
                  href={PROTOTYPE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open the interactive Figma prototype in a new tab"
                >
                  <img
                    className={styles.phone}
                    src={img('05 Prototype asset/05 Prototype pic.png')}
                    alt=""
                  />
                </a>
              </div>
            </div>

            <p className={styles.eyebrow}>Prototype</p>
            {/* Broken after the comma because that is where the reference breaks it: at
                20px both halves clear the heading's width, so no wrap can reproduce it. */}
            <h2 className={styles.heading}>
              Click the Mockup,
              <br />
              try it by yourself!
            </h2>
          </>
        )
      }}
    </PinnedStage>
  )
}

export default Prototype
