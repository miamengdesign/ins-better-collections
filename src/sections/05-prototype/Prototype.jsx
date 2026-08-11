import { useEffect, useState } from 'react'
import GradientStage from '../../components/GradientStage'
import PinnedStage from '../../components/PinnedStage'
import { PROTOTYPE_URL } from '../../config/links'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { img } from '../../lib/assets'
import { setExit05to06 } from '../../lib/handoff05to06'
import { setSolutionsPushT } from '../../lib/handoff04to05'
import { clamp, easeInOutQuint, lerp, rangeProgress } from '../../lib/motion'
import styles from './Prototype.module.css'

/**
 * Anchors:
 *  0 — push start (off-left)
 *  0.45 — settled Prototype
 *  1 — §05→06 exit complete
 *
 * Exit rhythm (p 0.45→1):
 *  card exits left → text fades → gradient fades → Behind the Work appears
 */
const OVERLAP_VH = 160
const PIN_TRACK_VH = 180
const ANCHORS = [0, 0.45, 1]
const DURATIONS = [1300, 2200]

function pushEnterX(p) {
  const t = easeInOutQuint(rangeProgress(p, 0, 0.45))
  return lerp(-100, 0, t)
}

function exitMotion(p) {
  const t = rangeProgress(p, 0.45, 1)
  const cardT = easeInOutQuint(rangeProgress(t, 0, 0.35))
  const textT = easeInOutQuint(rangeProgress(t, 0.28, 0.55))
  const gradT = easeInOutQuint(rangeProgress(t, 0.5, 0.85))
  return {
    exitT: t,
    panelX: lerp(0, -110, cardT),
    typeOpacity: 1 - textT,
    gradientOpacity: 1 - gradT,
  }
}

function Prototype() {
  const reduced = useReducedMotion()
  // Yield wheel capture to Behind the Work once the exit timeline finishes.
  const [zIndex, setZIndex] = useState(4)

  return (
    <PinnedStage
      className={styles.section}
      ariaLabel="Prototype"
      height={`calc(${OVERLAP_VH}vh + ${PIN_TRACK_VH}vh)`}
      overlapVh={OVERLAP_VH}
      startOffsetVh={0}
      style={{ zIndex }}
      cinematic={{
        anchors: ANCHORS,
        durations: DURATIONS,
        duration: 1300,
        reduced,
      }}
    >
      {({ progress, isPinned }) => {
        const p = isPinned ? clamp(progress, 0, 1) : 1
        return (
          <PrototypeFrame
            p={p}
            reduced={reduced}
            isPinned={isPinned}
            setZIndex={setZIndex}
          />
        )
      }}
    </PinnedStage>
  )
}

function PrototypeFrame({ p, reduced, isPinned, setZIndex }) {
  const entering = p < 0.45
  const exit = exitMotion(p)
  const x = entering ? pushEnterX(p) : exit.panelX
  const typeOpacity = entering
    ? p >= 0.44
      ? 1
      : 0
    : exit.typeOpacity
  const gradientOpacity = entering
    ? p >= 0.44
      ? 1
      : 0
    : exit.gradientOpacity

  useEffect(() => {
    setZIndex(isPinned && p < 0.999 ? 4 : 1)
  }, [p, isPinned, setZIndex])

  useEffect(() => {
    if (!isPinned) {
      setSolutionsPushT(1)
      setExit05to06(1)
      return undefined
    }
    // Push playhead for Solutions lock during enter.
    if (p <= 0.45) {
      setSolutionsPushT(easeInOutQuint(rangeProgress(p, 0, 0.45)))
      setExit05to06(0)
    } else {
      setSolutionsPushT(1)
      setExit05to06(exit.exitT)
    }
    return undefined
  }, [p, isPinned, exit.exitT])

  return (
    <>
      <div className={styles.gradientSlot} style={{ opacity: gradientOpacity }}>
        <GradientStage />
      </div>

      <div className={styles.panel} style={{ transform: `translateX(${x}%)` }}>
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
