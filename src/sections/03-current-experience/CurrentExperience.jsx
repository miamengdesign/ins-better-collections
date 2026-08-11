import CalloutCard from '../../components/CalloutCard'
import GradientStage from '../../components/GradientStage'
import PhoneMockup from '../../components/PhoneMockup'
import PinnedStage from '../../components/PinnedStage'
import StepTracker from '../../components/StepTracker'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { img } from '../../lib/assets'
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
 *  0     — pre-entrance (after §02 fade; header/panel hidden)
 *  0.22  — entrance complete → State 1 settled
 *  0.48  — State 2 settled
 *  0.74  — State 3 settled
 *  1     — §03→04 exit complete
 *
 * Entrance (p 0→0.22) phases — gradient never moves:
 *  A already done by §02 fade
 *  B 0.00–0.08  header/tracker/bullet fade in
 *  C 0.08–0.11  short pause
 *  D 0.11–0.18  evidence panel rises from below (soft ease-out)
 *  E 0.18–0.22  mockups/callouts fade in
 */
const ANCHORS = [0, 0.22, 0.48, 0.74, 1]
const DURATIONS = [2400, 1100, 1100, 1200]

const PIN_TRACK_VH = 220
/** Pull under Why Collection so the shared gradient stays put during handoff. */
const OVERLAP_VH = 100

const FADE_12 = [0.28, 0.42]
const FADE_23 = [0.54, 0.68]
const EXIT = [0.82, 1.0]

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

/** §02→03 entrance visuals as a pure function of early progress. */
function entranceMotion(p, reduced) {
  const headerT = easeInOutQuint(rangeProgress(p, 0, 0.08))
  const panelT = easeOutQuart(rangeProgress(p, 0.11, 0.18))
  const contentT = easeInOutQuint(rangeProgress(p, 0.18, 0.22))

  return {
    headerOpacity: headerT,
    panelY: reduced ? 0 : lerp(48, 0, panelT),
    panelOpacity: p < 0.11 ? 0 : lerp(0.15, 1, panelT),
    contentOpacity: contentT,
  }
}

function layerMotion(p, reduced) {
  const y = reduced ? 0 : 10
  let o1 = 1
  let o2 = 0
  let o3 = 0
  let y1 = 0
  let y2 = y
  let y3 = y

  if (p < FADE_12[0]) {
    /* state 1 */
  } else if (p < FADE_12[1]) {
    const t = easeInOutCubic(rangeProgress(p, FADE_12[0], FADE_12[1]))
    o1 = 1 - t
    o2 = t
    y1 = reduced ? 0 : lerp(0, -y, t)
    y2 = reduced ? 0 : lerp(y, 0, t)
  } else if (p < FADE_23[0]) {
    o1 = 0
    o2 = 1
    o3 = 0
    y1 = -y
    y2 = 0
    y3 = y
  } else if (p < FADE_23[1]) {
    const t = easeInOutCubic(rangeProgress(p, FADE_23[0], FADE_23[1]))
    o1 = 0
    o2 = 1 - t
    o3 = t
    y1 = -y
    y2 = reduced ? 0 : lerp(0, -y, t)
    y3 = reduced ? 0 : lerp(y, 0, t)
  } else {
    o1 = 0
    o2 = 0
    o3 = 1
    y1 = -y
    y2 = -y
    y3 = 0
  }

  return [
    { opacity: o1, y: y1 },
    { opacity: o2, y: y2 },
    { opacity: o3, y: y3 },
  ]
}

function dominantStateIndex(p) {
  if (p < (FADE_12[0] + FADE_12[1]) / 2) return 0
  if (p < (FADE_23[0] + FADE_23[1]) / 2) return 1
  return 2
}

function bulletOpacities(p) {
  return layerMotion(p, true).map((l) => l.opacity)
}

function exitMotion(p, reduced) {
  if (p < EXIT[0]) return { opacity: 1, y: 0 }
  const t = easeInOutQuint(rangeProgress(p, EXIT[0], EXIT[1]))
  return {
    opacity: 1 - t,
    y: reduced ? 0 : t * 40,
  }
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
      style={{ zIndex: 2 }}
      cinematic={{
        anchors: ANCHORS,
        durations: DURATIONS,
        duration: 1200,
        reduced,
      }}
    >
      {({ progress, isPinned }) => {
        if (!isPinned) {
          return <StackedFallback />
        }

        const p = clamp(progress, 0, 1)
        const entrance = entranceMotion(p, reduced)
        const layers = layerMotion(Math.max(p, 0.22), reduced)
        const bullets = bulletOpacities(Math.max(p, 0.22))
        const active = STATES[dominantStateIndex(Math.max(p, 0.22))]
        const exit = exitMotion(p, reduced)

        // During entrance, only state-1 content; gate with contentOpacity.
        const contentGate = p < 0.22 ? entrance.contentOpacity : 1
        const headerOpacity =
          p < 0.22 ? entrance.headerOpacity : exit.opacity < 1 ? exit.opacity : 1

        const panelY =
          p < 0.22 ? entrance.panelY : exit.y
        const panelOpacity =
          p < 0.22 ? entrance.panelOpacity : exit.opacity

        return (
          <>
            <GradientStage />

            <div className={styles.stack}>
              <header
                className={styles.header}
                style={{ opacity: headerOpacity }}
              >
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
                        opacity:
                          p < 0.22
                            ? i === 0
                              ? entrance.headerOpacity
                              : 0
                            : bullets[i],
                      }}
                      aria-hidden={
                        (p < 0.22
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
                    transform: `translateY(${layers[0].y}px)`,
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
                    transform: `translateY(${layers[1].y}px)`,
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
                    transform: `translateY(${layers[2].y}px)`,
                    pointerEvents:
                      layers[2].opacity * contentGate > 0.5 ? 'auto' : 'none',
                  }}
                  aria-hidden={layers[2].opacity * contentGate < 0.05}
                >
                  <EvidenceState3 />
                </div>
              </div>
            </div>
          </>
        )
      }}
    </PinnedStage>
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
