import { useEffect } from 'react'
import PinnedStage from '../../components/PinnedStage'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { img } from '../../lib/assets'
import { useExit05to06 } from '../../lib/handoff05to06'
import { setHandoff06to07, useHandoff06to07 } from '../../lib/handoff06to07'
import { clamp, easeInOutQuint, lerp, rangeProgress } from '../../lib/motion'
import styles from './BehindTheWork.module.css'

/**
 * Anchors:
 *  0 — State 1 (sketches)
 *  0.55 — State 2 overlays + statement settled (slow cloth-like cover)
 *  1 — §06→07 handoff complete (statement gone; 07 takes over)
 */
const PIN_TRACK_VH = 160
const OVERLAP_VH = 120
const OVERLAY_MAX = 0.7
const ANCHORS = [0, 0.55, 1]
const DURATIONS = [2400, 2400]

const STATEMENT =
  'Before narrowing the scope, I mapped issues across discovery, creation, sharing, and organization.'

function Collage() {
  return (
    <div className={styles.collage} aria-hidden="true">
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
 * Slow cloth-like cover for State 2 (p 0→0.55):
 * overlays ease up first; statement fades in only after layers are established.
 */
function state2Motion(p) {
  const cover = rangeProgress(p, 0, 0.55)
  const overlayT = easeInOutQuint(rangeProgress(cover, 0, 0.72))
  const statementT = easeInOutQuint(rangeProgress(cover, 0.55, 1))
  return {
    overlayOpacity: lerp(0, OVERLAY_MAX, overlayT),
    statementOpacity: statementT,
  }
}

/** p 0.55→1: statement fades very slowly, then handoff to §07. */
function exitTo07Motion(p) {
  const t = rangeProgress(p, 0.55, 1)
  // Statement leaves first and slowly; §07 bg/text follow via handoffT.
  const statementOut = easeInOutQuint(rangeProgress(t, 0, 0.55))
  return {
    handoffT: t,
    statementOpacity: 1 - statementOut,
    overlayOpacity: OVERLAY_MAX,
    stageOpacity: 1 - easeInOutQuint(rangeProgress(t, 0.45, 1)),
  }
}

function BehindTheWork() {
  const reduced = useReducedMotion()
  const enterFrom05 = useExit05to06()
  const exitTo07 = useHandoff06to07()

  // z stack: under Prototype while §05 exits → front for State 2 → yield to Wrap Up.
  const zIndex =
    exitTo07 >= 0.999 ? 2 : enterFrom05 >= 0.999 ? 5 : 3

  return (
    <PinnedStage
      className={styles.section}
      ariaLabel="Behind the Work"
      height={`calc(${OVERLAP_VH}vh + ${PIN_TRACK_VH}vh)`}
      overlapVh={OVERLAP_VH}
      startOffsetVh={0}
      style={{ zIndex }}
      cinematic={{
        anchors: ANCHORS,
        durations: DURATIONS,
        duration: 2400,
        reduced,
      }}
    >
      {({ progress, isPinned }) => {
        if (!isPinned) {
          return <StaticEndState />
        }

        const p = clamp(progress, 0, 1)
        return (
          <BehindFrame p={p} reduced={reduced} enterFrom05={enterFrom05} />
        )
      }}
    </PinnedStage>
  )
}

function BehindFrame({ p, reduced, enterFrom05 }) {
  const s2 = state2Motion(p)
  const exit = exitTo07Motion(p)
  const inExit = p > 0.55

  const overlayOpacity = inExit ? exit.overlayOpacity : s2.overlayOpacity
  const statementOpacity = inExit ? exit.statementOpacity : s2.statementOpacity
  // Appear under §05 as its gradient fades (enterFrom05).
  const reveal = reduced ? 1 : easeInOutQuint(enterFrom05)
  const stageOpacity = (inExit ? exit.stageOpacity : 1) * Math.max(reveal, 0.001)

  useEffect(() => {
    setHandoff06to07(inExit ? exit.handoffT : 0)
  }, [inExit, exit.handoffT])

  return (
    <div style={{ opacity: stageOpacity }}>
      <Collage />
      <State1Copy />
      <State2Overlays opacity={overlayOpacity} />
      <p className={styles.statement} style={{ opacity: statementOpacity }}>
        {STATEMENT}
      </p>
    </div>
  )
}

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
