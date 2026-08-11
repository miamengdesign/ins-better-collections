import GradientStage from '../../components/GradientStage'
import PhoneMockup from '../../components/PhoneMockup'
import PinnedStage from '../../components/PinnedStage'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { img } from '../../lib/assets'
import { useSolutionsPushT } from '../../lib/handoff04to05'
import {
  clamp,
  easeInOutCubic,
  easeInOutQuint,
  easeOutBack,
  lerp,
  rangeProgress,
} from '../../lib/motion'
import styles from './Solutions.module.css'

const PIN_TRACK_VH = 240

/** Cinematic steps: enter → sol1 → sol2 → sol3 → push complete. */
const ANCHORS = [0, 0.15, 0.42, 0.72, 1]
const DURATIONS = [1100, 1100, 1100, 1300]

const ENTER = [0, 0.15]
const FADE_12 = [0.28, 0.42]
const FADE_23 = [0.58, 0.72]
const PUSH = [0.72, 1]

const STATES = [
  {
    id: 'sol1',
    eyebrow: 'Solution 01',
    heading: 'Reels Detail Enhancement',
    badge: '✅ Interface Consistency',
    explanation: (
      <>
        Users can easily find the <strong>Collection option</strong> in
        <br />
        the Reel <strong>detail view</strong>, keeping the experience
        <br />
        <strong>consistent</strong> across all content formats.
      </>
    ),
    src: img('04 Solution asset/04 Solution 1 pic.png'),
    alt: 'Reel detail view with a Collection save option',
  },
  {
    id: 'sol2',
    eyebrow: 'Solution 02',
    heading: 'New Collection Enhancement',
    badge: '✅ Multi-User Collaboration',
    explanation: (
      <>
        Users can now create a new collection and <strong>share</strong> it
        <br />
        with <strong>multiple</strong> friends. The <strong>selection count</strong>
        <br />
        helps them clearly see how many people are added.
      </>
    ),
    src: img('04 Solution asset/04 Solution 2 pic.png'),
    alt: 'New collection flow with multi-friend selection',
  },
  {
    id: 'sol3',
    eyebrow: 'Solution 03',
    heading: 'Manage Collection Enhancement',
    badge: '✅ Collaboration Consistency',
    explanation: (
      <>
        Sharing an <strong>existing</strong> collection is now simple—users
        <br />
        can view current collaborators and <strong>add new ones</strong>
        <br />
        whenever they like.
      </>
    ),
    src: img('04 Solution asset/04 Solution 3 pic.png'),
    alt: 'Manage collection share sheet with collaborators',
  },
]

/** Mockup layer opacities + subtle drift (mirrors §03 evidence crossfade). */
function layerMotion(p, reduced) {
  const drift = reduced ? 0 : 12

  if (p < FADE_12[0]) {
    return [
      { opacity: 1, x: 0, y: 0 },
      { opacity: 0, x: drift, y: drift },
      { opacity: 0, x: drift, y: drift },
    ]
  }
  if (p < FADE_12[1]) {
    const t = easeInOutCubic(rangeProgress(p, FADE_12[0], FADE_12[1]))
    return [
      { opacity: 1 - t, x: reduced ? 0 : lerp(0, -drift, t), y: reduced ? 0 : lerp(0, -drift, t) },
      { opacity: t, x: reduced ? 0 : lerp(drift, 0, t), y: reduced ? 0 : lerp(drift, 0, t) },
      { opacity: 0, x: drift, y: drift },
    ]
  }
  if (p < FADE_23[0]) {
    return [
      { opacity: 0, x: -drift, y: -drift },
      { opacity: 1, x: 0, y: 0 },
      { opacity: 0, x: drift, y: drift },
    ]
  }
  if (p < FADE_23[1]) {
    const t = easeInOutCubic(rangeProgress(p, FADE_23[0], FADE_23[1]))
    return [
      { opacity: 0, x: -drift, y: -drift },
      { opacity: 1 - t, x: reduced ? 0 : lerp(0, -drift, t), y: reduced ? 0 : lerp(0, -drift, t) },
      { opacity: t, x: reduced ? 0 : lerp(drift, 0, t), y: reduced ? 0 : lerp(drift, 0, t) },
    ]
  }
  return [
    { opacity: 0, x: -drift, y: -drift },
    { opacity: 0, x: -drift, y: -drift },
    { opacity: 1, x: 0, y: 0 },
  ]
}

function copyOpacities(p) {
  return layerMotion(p, true).map((l) => l.opacity)
}

/**
 * Light-panel X as a pure function of local `p`, with §04→05 push optionally
 * driven by the shared handoff playhead (keeps Prototype locked).
 */
function panelX(p, reduced, sharedPushT) {
  if (p < ENTER[1]) {
    const raw = rangeProgress(p, ENTER[0], ENTER[1])
    const t = reduced ? easeInOutCubic(raw) : easeOutBack(raw)
    return lerp(100, 0, t)
  }
  // Prefer the shared push playhead once the handoff has started.
  if (sharedPushT > 0.001) {
    return lerp(0, 100, sharedPushT)
  }
  if (p >= PUSH[0]) {
    const t = rangeProgress(p, PUSH[0], PUSH[1])
    return lerp(0, 100, easeInOutQuint(t))
  }
  return 0
}

function Solutions() {
  const reduced = useReducedMotion()
  const sharedPushT = useSolutionsPushT()

  return (
    <PinnedStage
      className={styles.section}
      ariaLabel="Solutions"
      height={`calc(100vh + ${PIN_TRACK_VH}vh)`}
      overlapVh={100}
      startOffsetVh={0}
      style={{ zIndex: 2 }}
      cinematic={{
        anchors: ANCHORS,
        durations: DURATIONS,
        duration: 1100,
        reduced,
      }}
    >
      {({ progress, isPinned }) => {
        if (!isPinned) {
          return <StackedFallback />
        }

        const p = clamp(progress, 0, 1)
        const layers = layerMotion(p, reduced)
        const copies = copyOpacities(p)
        const x = panelX(p, reduced, sharedPushT)

        return (
          <>
            <GradientStage />

            <div className={styles.left}>
              {STATES.map((state, i) => (
                <div
                  key={state.id}
                  className={styles.copyLayer}
                  style={{ opacity: copies[i] }}
                  aria-hidden={copies[i] < 0.5}
                >
                  <p className={styles.eyebrow}>{state.eyebrow}</p>
                  <h2 className={styles.heading}>{state.heading}</h2>
                  <div className={styles.badgeGroup}>
                    <span className={styles.badge}>{state.badge}</span>
                    <p className={styles.explanation}>{state.explanation}</p>
                  </div>
                </div>
              ))}
            </div>

            <div
              className={styles.right}
              style={{ transform: `translateX(${x}%)` }}
            >
              {STATES.map((state, i) => (
                <div
                  key={state.id}
                  className={styles.mockupLayer}
                  style={{
                    opacity: layers[i].opacity,
                    transform: `translate(${layers[i].x}px, ${layers[i].y}px)`,
                    pointerEvents: layers[i].opacity > 0.5 ? 'auto' : 'none',
                  }}
                  aria-hidden={layers[i].opacity < 0.05}
                >
                  <div className={styles.mockup}>
                    <PhoneMockup
                      className={styles.phone}
                      src={state.src}
                      alt={state.alt}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )
      }}
    </PinnedStage>
  )
}

/** Mobile: three stacked static solution groups in reading order. */
function StackedFallback() {
  return (
    <div className={styles.stacked}>
      {STATES.map((state) => (
        <div key={state.id} className={styles.stackedBlock}>
          <GradientStage className={styles.stackedBg} />
          <div className={styles.left}>
            <p className={styles.eyebrow}>{state.eyebrow}</p>
            <h2 className={styles.heading}>{state.heading}</h2>
            <div className={styles.badgeGroup}>
              <span className={styles.badge}>{state.badge}</span>
              <p className={styles.explanation}>{state.explanation}</p>
            </div>
          </div>
          <div className={styles.right}>
            <div className={styles.mockup}>
              <PhoneMockup
                className={styles.phone}
                src={state.src}
                alt={state.alt}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Solutions
