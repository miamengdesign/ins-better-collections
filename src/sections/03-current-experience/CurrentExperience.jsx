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
  lerp,
  rangeProgress,
} from '../../lib/motion'
import styles from './CurrentExperience.module.css'

const PIN_TRACK_VH = 360

/** Crossfade windows (~15% of local progress) centered on the state boundaries. */
const FADE_12 = [0.225, 0.375]
const FADE_23 = [0.575, 0.725]
/** §03→04 evidence-canvas exit (ANIMATION_SPEC). */
const EXIT = [0.85, 1.0]

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
    // Figma refs keep the Save→Create gap visualized as a dotted connector.
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

/**
 * Opacity (and optional drift) for each evidence layer as a pure function of `p`.
 * Overlap windows crossfade the outgoing/incoming pair; elsewhere one layer is fully on.
 */
function layerMotion(p, reduced) {
  const y = reduced ? 0 : 12

  let o1 = 1
  let o2 = 0
  let o3 = 0
  let y1 = 0
  let y2 = y
  let y3 = y

  if (p < FADE_12[0]) {
    o1 = 1
    o2 = 0
    o3 = 0
    y1 = 0
    y2 = y
    y3 = y
  } else if (p < FADE_12[1]) {
    const t = easeInOutCubic(rangeProgress(p, FADE_12[0], FADE_12[1]))
    o1 = 1 - t
    o2 = t
    o3 = 0
    y1 = reduced ? 0 : lerp(0, -y, t)
    y2 = reduced ? 0 : lerp(y, 0, t)
    y3 = y
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

/** Dominant state index for tracker/bullet at the overlap midpoint. */
function dominantStateIndex(p) {
  if (p < (FADE_12[0] + FADE_12[1]) / 2) return 0
  if (p < (FADE_23[0] + FADE_23[1]) / 2) return 1
  return 2
}

/** Bullet opacities — simple crossfade on the same overlap windows. */
function bulletOpacities(p) {
  const layers = layerMotion(p, true)
  return layers.map((l) => l.opacity)
}

function exitMotion(p, reduced) {
  if (p < EXIT[0]) return { opacity: 1, y: 0 }
  const t = easeInOutCubic(rangeProgress(p, EXIT[0], EXIT[1]))
  // Spec: translateY(0 → 40vh) + opacity(1 → 0). Keep the move under reduced-motion
  // only if we drop drift elsewhere; exit is scroll-coupled, but prefer opacity-only
  // when reduced (no large translate).
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
      height={`${PIN_TRACK_VH}vh`}
      style={{ zIndex: 2 }}
    >
      {({ progress, isPinned }) => {
        if (!isPinned) {
          return <StackedFallback />
        }

        const p = clamp(progress, 0, 1)
        const layers = layerMotion(p, reduced)
        const bullets = bulletOpacities(p)
        const active = STATES[dominantStateIndex(p)]
        const exit = exitMotion(p, reduced)

        return (
          <>
            <GradientStage />

            <div className={styles.stack}>
              <header className={styles.header}>
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
                      style={{ opacity: bullets[i] }}
                      aria-hidden={bullets[i] < 0.5}
                    >
                      {state.bullet}
                    </p>
                  ))}
                </div>
              </header>

              <div
                className={styles.panel}
                style={{
                  opacity: exit.opacity,
                  transform: `translateY(${exit.y}vh)`,
                }}
              >
                <div
                  className={styles.layer}
                  style={{
                    opacity: layers[0].opacity,
                    transform: `translateY(${layers[0].y}px)`,
                    pointerEvents: layers[0].opacity > 0.5 ? 'auto' : 'none',
                  }}
                  aria-hidden={layers[0].opacity < 0.05}
                >
                  <EvidenceState1 />
                </div>
                <div
                  className={styles.layer}
                  style={{
                    opacity: layers[1].opacity,
                    transform: `translateY(${layers[1].y}px)`,
                    pointerEvents: layers[1].opacity > 0.5 ? 'auto' : 'none',
                  }}
                  aria-hidden={layers[1].opacity < 0.05}
                >
                  <EvidenceState2 />
                </div>
                <div
                  className={styles.layer}
                  style={{
                    opacity: layers[2].opacity,
                    transform: `translateY(${layers[2].y}px)`,
                    pointerEvents: layers[2].opacity > 0.5 ? 'auto' : 'none',
                  }}
                  aria-hidden={layers[2].opacity < 0.05}
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

/** Mobile: three stacked static groups in reading order (PinnedStage disabled). */
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
