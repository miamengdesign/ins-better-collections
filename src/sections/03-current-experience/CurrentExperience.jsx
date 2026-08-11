import { useEffect } from 'react'
import CalloutCard from '../../components/CalloutCard'
import CardNav from '../../components/CardNav'
import GradientStage from '../../components/GradientStage'
import PhoneMockup from '../../components/PhoneMockup'
import PinnedStage from '../../components/PinnedStage'
import StepTracker from '../../components/StepTracker'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { img } from '../../lib/assets'
import { setHandoff03to04 } from '../../lib/handoff03to04'
import {
  clamp,
  easeInOutCubic,
  easeInOutQuint,
  easeOutQuart,
  lerp,
  rangeProgress,
} from '../../lib/motion'
import styles from './CurrentExperience.module.css'

/**
 * Cinematic anchors:
 *  0     — pre-entrance
 *  0.20  — entrance complete → State 1
 *  0.42  — State 2
 *  0.64  — State 3
 *  1.00  — §03→04 handoff complete
 *
 * Arrows only step among states 1–3 (indices 1–3). Scroll also runs entrance/exit.
 */
const ANCHORS = [0, 0.2, 0.42, 0.64, 1]
const DURATIONS = [2400, 1100, 1100, 2800]

const PIN_TRACK_VH = 220
const OVERLAP_VH = 100

const FADE_12 = [0.26, 0.38]
const FADE_23 = [0.48, 0.6]
/** Local progress window for the §03→04 handoff (published to Solutions). */
const HANDOFF = [0.64, 1]

const STATES = [
  {
    id: 'state1',
    activeSteps: ['Discover', 'Save'],
    dottedAfter: 'Save',
    bullet:
      'Users lose a familiar saving action when moving from feed to detail.',
  },
  {
    id: 'state2',
    activeSteps: ['Create', 'Collaborate'],
    dottedAfter: 'Save',
    bullet:
      'The creation flow is easily blocked, and collaboration is limited to one friend.',
  },
  {
    id: 'state3',
    activeSteps: ['Manage'],
    dottedAfter: 'Save',
    bullet:
      'Once a Collection is created, users cannot add or manage collaborators later.',
  },
]

function entranceMotion(p, reduced) {
  const headerT = easeInOutQuint(rangeProgress(p, 0, 0.07))
  const panelT = easeOutQuart(rangeProgress(p, 0.1, 0.16))
  const contentT = easeInOutQuint(rangeProgress(p, 0.16, 0.2))
  return {
    headerOpacity: headerT,
    panelY: reduced ? 0 : lerp(48, 0, panelT),
    panelOpacity: p < 0.1 ? 0 : lerp(0.15, 1, panelT),
    contentOpacity: contentT,
  }
}

/**
 * §03→04 local exit phases (gradient stays put):
 *  0.00–0.28  card descends
 *  0.22–0.45  upper text fades
 *  (04 entrance is driven on the Solutions side from the same handoff T)
 */
function handoffExitMotion(t, reduced) {
  const cardT = easeInOutQuint(rangeProgress(t, 0, 0.28))
  const headerT = easeInOutQuint(rangeProgress(t, 0.22, 0.45))
  return {
    panelY: reduced ? 0 : lerp(0, 55, cardT),
    panelOpacity: 1 - cardT,
    headerOpacity: 1 - headerT,
    contentOpacity: 1 - cardT,
  }
}

/** Opacity-only evidence crossfade — no diagonal drift. */
function layerMotion(p) {
  let o1 = 1
  let o2 = 0
  let o3 = 0

  if (p < FADE_12[0]) {
    /* state 1 */
  } else if (p < FADE_12[1]) {
    const t = easeInOutCubic(rangeProgress(p, FADE_12[0], FADE_12[1]))
    o1 = 1 - t
    o2 = t
  } else if (p < FADE_23[0]) {
    o1 = 0
    o2 = 1
    o3 = 0
  } else if (p < FADE_23[1]) {
    const t = easeInOutCubic(rangeProgress(p, FADE_23[0], FADE_23[1]))
    o1 = 0
    o2 = 1 - t
    o3 = t
  } else {
    o1 = 0
    o2 = 0
    o3 = 1
  }

  return [{ opacity: o1 }, { opacity: o2 }, { opacity: o3 }]
}

function dominantStateIndex(p) {
  if (p < (FADE_12[0] + FADE_12[1]) / 2) return 0
  if (p < (FADE_23[0] + FADE_23[1]) / 2) return 1
  return 2
}

function bulletOpacities(p) {
  return layerMotion(p).map((l) => l.opacity)
}

function EvidenceState1() {
  return (
    <div className={`${styles.evidence} ${styles.evidenceState1}`}>
      <PhoneMockup
        className={styles.phone}
        src={img('03 Current Experience asset/03 Current Experience 1 pic1.png')}
        alt=""
      />
      <PhoneMockup
        className={styles.phone}
        src={img('03 Current Experience asset/03 Current Experience 1 pic2.png')}
        alt=""
      />
      <CalloutCard
        className={styles.callout}
        src={img('03 Current Experience asset/03 Current Experience 1 txt.png')}
        alt=""
      />
      <PhoneMockup
        className={styles.phone3}
        src={img('03 Current Experience asset/03 Current Experience 1 pic3.png')}
        alt=""
      />
    </div>
  )
}

function EvidenceState2() {
  return (
    <div className={`${styles.evidence} ${styles.evidenceState2}`}>
      <img
        className={styles.group1}
        src={img('03 Current Experience asset/03 Current Experience 2 group1.png')}
        alt=""
        aria-hidden="true"
      />
      <img
        className={styles.group2}
        src={img('03 Current Experience asset/03 Current Experience 2 group2.png')}
        alt=""
        aria-hidden="true"
      />
    </div>
  )
}

function EvidenceState3() {
  return (
    <div className={`${styles.evidence} ${styles.evidenceState3}`}>
      <img
        className={styles.state3Pic}
        src={img('03 Current Experience asset/03 Current Experience 3 pic.png')}
        alt=""
        aria-hidden="true"
      />
    </div>
  )
}

function CurrentExperience() {
  const reduced = useReducedMotion()

  return (
    <PinnedStage
      className={styles.section}
      ariaLabel="Current Experience"
      height={`calc(${OVERLAP_VH}vh + ${PIN_TRACK_VH}vh)`}
      overlapVh={OVERLAP_VH}
      startOffsetVh={0}
      style={{ zIndex: 3 }}
      cinematic={{
        anchors: ANCHORS,
        durations: DURATIONS,
        duration: 1200,
        reduced,
      }}
    >
      {({ progress, isPinned, stepIndex, goToStep, animating }) => {
        if (!isPinned) {
          return <StackedFallback />
        }

        const p = clamp(progress, 0, 1)
        const handoffT = rangeProgress(p, HANDOFF[0], HANDOFF[1])

        return (
          <CurrentFrame
            p={p}
            handoffT={handoffT}
            reduced={reduced}
            stepIndex={stepIndex}
            goToStep={goToStep}
            animating={animating}
          />
        )
      }}
    </PinnedStage>
  )
}

function CurrentFrame({ p, handoffT, reduced, stepIndex, goToStep, animating }) {
  useEffect(() => {
    setHandoff03to04(handoffT)
  }, [handoffT])

  const entrance = entranceMotion(p, reduced)
  const exit = handoffExitMotion(handoffT, reduced)
  const inHandoff = p >= HANDOFF[0]
  const inEntrance = p < 0.2

  const layers = layerMotion(Math.max(p, 0.2))
  const bullets = bulletOpacities(Math.max(p, 0.2))
  const active = STATES[dominantStateIndex(Math.max(p, 0.2))]

  const headerOpacity = inEntrance
    ? entrance.headerOpacity
    : inHandoff
      ? exit.headerOpacity
      : 1
  const panelY = inEntrance ? entrance.panelY : inHandoff ? exit.panelY : 0
  const panelOpacity = inEntrance
    ? entrance.panelOpacity
    : inHandoff
      ? exit.panelOpacity
      : 1
  const contentGate = inEntrance
    ? entrance.contentOpacity
    : inHandoff
      ? exit.contentOpacity
      : 1

  // Arrows only navigate evidence states (steps 1–3).
  const canPrev = stepIndex > 1 && !animating
  const canNext = stepIndex >= 1 && stepIndex < 3 && !animating

  return (
    <>
      <GradientStage />

      <div className={styles.stack}>
        <header className={styles.header} style={{ opacity: headerOpacity }}>
          <h2 className={styles.title}>Current Experience</h2>
          <StepTracker
            activeSteps={active.activeSteps}
            dottedAfter={active.dottedAfter}
          />
          <div className={styles.bulletStage} aria-live="polite">
            {STATES.map((state, i) => (
              <p
                key={state.id}
                className={styles.bullet}
                style={{
                  opacity: inEntrance
                    ? i === 0
                      ? entrance.headerOpacity
                      : 0
                    : bullets[i],
                }}
                aria-hidden={
                  (inEntrance
                    ? i === 0
                      ? entrance.headerOpacity
                      : 0
                    : bullets[i]) < 0.5
                }
              >
                {state.bullet}
              </p>
            ))}
          </div>
        </header>

        <div
          className={styles.panel}
          style={{
            opacity: panelOpacity,
            transform: `translateY(${panelY}vh)`,
          }}
        >
          <div
            className={styles.layer}
            style={{
              opacity: layers[0].opacity * contentGate,
              pointerEvents:
                layers[0].opacity * contentGate > 0.5 ? 'auto' : 'none',
            }}
            aria-hidden={layers[0].opacity * contentGate < 0.05}
          >
            <EvidenceState1 />
          </div>
          <div
            className={styles.layer}
            style={{
              opacity: layers[1].opacity * contentGate,
              pointerEvents:
                layers[1].opacity * contentGate > 0.5 ? 'auto' : 'none',
            }}
            aria-hidden={layers[1].opacity * contentGate < 0.05}
          >
            <EvidenceState2 />
          </div>
          <div
            className={styles.layer}
            style={{
              opacity: layers[2].opacity * contentGate,
              pointerEvents:
                layers[2].opacity * contentGate > 0.5 ? 'auto' : 'none',
            }}
            aria-hidden={layers[2].opacity * contentGate < 0.05}
          >
            <EvidenceState3 />
          </div>

          {!inEntrance && !inHandoff && (
            <CardNav
              onPrev={() => goToStep(stepIndex - 1)}
              onNext={() => goToStep(stepIndex + 1)}
              disablePrev={!canPrev}
              disableNext={!canNext}
            />
          )}
        </div>
      </div>
    </>
  )
}

function StackedFallback() {
  return (
    <div className={styles.stacked}>
      <GradientStage className={styles.stackedBg} />
      {STATES.map((state, i) => (
        <div key={state.id} className={styles.stackedBlock}>
          <header className={styles.header}>
            <h2 className={styles.title}>Current Experience</h2>
            <StepTracker
              activeSteps={state.activeSteps}
              dottedAfter={state.dottedAfter}
            />
            <p className={styles.bulletStatic}>{state.bullet}</p>
          </header>
          <div className={styles.panelStatic}>
            {i === 0 && <EvidenceState1 />}
            {i === 1 && <EvidenceState2 />}
            {i === 2 && <EvidenceState3 />}
          </div>
        </div>
      ))}
    </div>
  )
}

export default CurrentExperience
