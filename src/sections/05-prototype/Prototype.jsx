import { useEffect } from 'react'
import GradientStage from '../../components/GradientStage'
import PinnedStage from '../../components/PinnedStage'
import { PROTOTYPE_URL } from '../../config/links'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { img } from '../../lib/assets'
import { setSolutionsPushT } from '../../lib/handoff04to05'
import { clamp, easeInOutQuint, lerp, rangeProgress } from '../../lib/motion'
import styles from './Prototype.module.css'

/**
 * §04→05 push entrance then quiet hold. First cinematic step plays the physical
 * push (and drives Solutions’ panel via the shared handoff playhead).
 */

const OVERLAP_VH = 160
const PIN_TRACK_VH = 160

/** Step 0 = mid-push start (off-left); step 1 = settled. */
const ANCHORS = [0, 1]
const DURATIONS = [1300]

function panelEnterX(p) {
  const t = easeInOutQuint(rangeProgress(p, 0, 1))
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
      cinematic={{
        anchors: ANCHORS,
        durations: DURATIONS,
        duration: 1300,
        reduced,
      }}
    >
      {({ progress, isPinned }) => {
        const p = isPinned ? clamp(progress, 0, 1) : 1
        const x = isPinned ? panelEnterX(p) : 0
        const settled = !isPinned || p >= 0.999
        const gradientOpacity = settled ? 1 : 0
        const typeOpacity = settled ? 1 : 0

        return (
          <PrototypeFrame
            p={p}
            x={x}
            gradientOpacity={gradientOpacity}
            typeOpacity={typeOpacity}
            reduced={reduced}
            isPinned={isPinned}
          />
        )
      }}
    </PinnedStage>
  )
}

function PrototypeFrame({ p, x, gradientOpacity, typeOpacity, reduced, isPinned }) {
  // Publish push playhead so Solutions exits in lockstep.
  useEffect(() => {
    if (!isPinned) {
      setSolutionsPushT(1)
      return undefined
    }
    setSolutionsPushT(easeInOutQuint(p))
    return undefined
  }, [p, isPinned])

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

      <p className={styles.eyebrow} style={{ opacity: typeOpacity }}>
        Prototype
      </p>
      <h2 className={styles.heading} style={{ opacity: typeOpacity }}>
        Click the Mockup,
        <br />
        try it by yourself!
      </h2>
    </>
  )
}

export default Prototype
