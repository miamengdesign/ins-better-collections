import { useEffect } from 'react'
import PinnedStage from '../../components/PinnedStage'
import Stage from '../../components/Stage'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { img } from '../../lib/assets'
import { setHandoff06to07 } from '../../lib/handoff06to07'
import {
  clamp,
  easeInOutQuint,
  lerp,
  rangeProgress,
} from '../../lib/motion'
import { exit05to06T } from '../../nav/exit05to06'
import { SCENE_INDEX } from '../../nav/scenes'
import { useSceneBlend } from '../../nav/useNavigator'
import styles from './BehindTheWork.module.css'

/**
 * §06 Behind the Work — entrance to State 1, then dark-cloth veil to State 2.
 * One physical sketch collage stays mounted; overlays/statement are opacity only.
 * §06→07 remains for a later migration.
 */

const BEHIND_1 = SCENE_INDEX['behind-1']
const BEHIND_2 = SCENE_INDEX['behind-2']
const OVERLAY_MAX = 0.7
const PIN_TRACK_VH = 160
const OVERLAP_VH = 120
const ANCHORS = [0, 0.55, 1]
const DURATIONS = [2400, 2400]

const STATEMENT =
  'Before narrowing the scope, I mapped issues across discovery, creation, sharing, and organization.'

function Collage() {
  return (
    <div className={styles.collage} aria-hidden="true">
      <img
        className={styles.pic3}
        src={img('06 Behind asset/06 Behind 1 pic3.png')}
        alt=""
      />
      <img
        className={styles.pic1}
        src={img('06 Behind asset/06 Behind 1 pic1.png')}
        alt=""
      />
      <img
        className={styles.pic2}
        src={img('06 Behind asset/06 Behind 1 pic2.png')}
        alt=""
      />
      <img
        className={styles.pic4}
        src={img('06 Behind asset/06 Behind 1 pic4.png')}
        alt=""
      />
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

/**
 * Phase D — §06 State 1 composition fades in after §05 card/copy/gradient
 * are underway (shared exit05to06T playhead).
 */
function revealFromExit(exitT, reduced) {
  if (reduced) return rangeProgress(exitT, 0.55, 1)
  return easeInOutQuint(rangeProgress(exitT, 0.55, 1))
}

/**
 * behind-1 → behind-2 veil playhead 0→1 (reverse via 1−t).
 * Sketches never move; only overlay + statement opacities change.
 */
function state2CoverT(blend) {
  if (blend.settled) {
    return blend.sceneIndex >= BEHIND_2 ? 1 : 0
  }
  if (blend.from === BEHIND_1 && blend.to === BEHIND_2) return blend.t
  if (blend.from === BEHIND_2 && blend.to === BEHIND_1) return 1 - blend.t
  if (blend.to >= BEHIND_2 || blend.from >= BEHIND_2) return 1
  return 0
}

/**
 * Phase A  0.00–0.72  multicolor + black overlays build to 70%
 * Phase B  0.55–1.00  centered statement fades in after veil is established
 */
function veilMotion(cover, reduced) {
  const overlayT = reduced
    ? rangeProgress(cover, 0, 0.72)
    : easeInOutQuint(rangeProgress(cover, 0, 0.72))
  const statementT = reduced
    ? rangeProgress(cover, 0.55, 1)
    : easeInOutQuint(rangeProgress(cover, 0.55, 1))
  return {
    overlayOpacity: lerp(0, OVERLAY_MAX, overlayT),
    statementOpacity: statementT,
  }
}

function BehindTheWork({ phase1Static = false } = {}) {
  const isMobile = useMediaQuery('(max-width: 767px)')
  const reduced = useReducedMotion()

  if (isMobile) {
    return <MobilePinnedBehind reduced={reduced} />
  }

  if (phase1Static) {
    return (
      <Stage className={styles.section} aria-label="Behind the Work">
        <State1Frame />
      </Stage>
    )
  }

  return <CinematicBehind reduced={reduced} />
}

function State1Frame() {
  return (
    <>
      <Collage />
      <State1Copy />
    </>
  )
}

function CinematicBehind({ reduced }) {
  const blend = useSceneBlend()
  const exitT = exit05to06T(blend)
  const cover = state2CoverT(blend)
  const involved =
    exitT > 0.001 ||
    cover > 0.001 ||
    (!blend.settled &&
      ((blend.to >= BEHIND_1 && blend.to <= BEHIND_2) ||
        (blend.from >= BEHIND_1 && blend.from <= BEHIND_2))) ||
    (blend.settled &&
      blend.sceneIndex >= BEHIND_1 &&
      blend.sceneIndex <= BEHIND_2)

  if (!involved) {
    return null
  }

  const reveal = revealFromExit(exitT, reduced)
  const veil = veilMotion(cover, reduced)

  return (
    <section
      className={styles.phaseLayer}
      aria-label="Behind the Work"
      style={{ opacity: Math.max(reveal, 0.001) }}
      aria-hidden={reveal < 0.05}
    >
      {/* One physical collage — stationary under both states. */}
      <State1Frame />
      <State2Overlays opacity={veil.overlayOpacity} />
      <p
        className={styles.statement}
        style={{ opacity: veil.statementOpacity }}
        aria-hidden={veil.statementOpacity < 0.05}
      >
        {STATEMENT}
      </p>
    </section>
  )
}

/** Mobile keeps the legacy pinned stage (includes State 2 for stacked scroll). */
function MobilePinnedBehind({ reduced }) {
  return (
    <PinnedStage
      className={styles.section}
      ariaLabel="Behind the Work"
      height={`calc(${OVERLAP_VH}vh + ${PIN_TRACK_VH}vh)`}
      overlapVh={OVERLAP_VH}
      startOffsetVh={0}
      cinematic={{
        anchors: ANCHORS,
        durations: DURATIONS,
        duration: 2400,
        reduced,
      }}
    >
      {({ progress, isPinned }) => {
        if (!isPinned) {
          return (
            <>
              <State1Frame />
              <State2Overlays opacity={OVERLAY_MAX} />
              <p className={styles.statement} style={{ opacity: 1 }}>
                {STATEMENT}
              </p>
            </>
          )
        }

        const p = clamp(progress, 0, 1)
        return <MobileBehindFrame p={p} />
      }}
    </PinnedStage>
  )
}

function state2Motion(p) {
  const cover = rangeProgress(p, 0, 0.55)
  const overlayT = easeInOutQuint(rangeProgress(cover, 0, 0.72))
  const statementT = easeInOutQuint(rangeProgress(cover, 0.55, 1))
  return {
    overlayOpacity: lerp(0, OVERLAY_MAX, overlayT),
    statementOpacity: statementT,
  }
}

function exitTo07Motion(p) {
  const t = rangeProgress(p, 0.55, 1)
  const statementOut = easeInOutQuint(rangeProgress(t, 0, 0.55))
  return {
    handoffT: t,
    statementOpacity: 1 - statementOut,
    overlayOpacity: OVERLAY_MAX,
    stageOpacity: 1 - easeInOutQuint(rangeProgress(t, 0.45, 1)),
  }
}

function MobileBehindFrame({ p }) {
  const s2 = state2Motion(p)
  const exit = exitTo07Motion(p)
  const inExit = p > 0.55
  const overlayOpacity = inExit ? exit.overlayOpacity : s2.overlayOpacity
  const statementOpacity = inExit ? exit.statementOpacity : s2.statementOpacity
  const stageOpacity = inExit ? exit.stageOpacity : 1

  useEffect(() => {
    setHandoff06to07(inExit ? exit.handoffT : 0)
  }, [inExit, exit.handoffT])

  return (
    <div style={{ opacity: stageOpacity }}>
      <State1Frame />
      <State2Overlays opacity={overlayOpacity} />
      <p className={styles.statement} style={{ opacity: statementOpacity }}>
        {STATEMENT}
      </p>
    </div>
  )
}

export default BehindTheWork
