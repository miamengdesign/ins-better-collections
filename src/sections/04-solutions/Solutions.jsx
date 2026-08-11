import GradientStage from '../../components/GradientStage'
import PhoneMockup from '../../components/PhoneMockup'
import PinnedStage from '../../components/PinnedStage'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { img } from '../../lib/assets'
import {
  clamp,
  easeInOutCubic,
  easeOutBack,
  lerp,
  rangeProgress,
} from '../../lib/motion'
import styles from './Solutions.module.css'

const PIN_TRACK_VH = 360

/** §03→04: Solution light panel enters from the right. */
const ENTER = [0, 0.15]
/** Crossfade windows (~15%) between the three solution states. */
const FADE_12 = [0.35, 0.5]
const FADE_23 = [0.65, 0.8]

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
 * Light panel entrance from the right (ANIMATION_SPEC §03→04).
 * `translateX(100% → 0)` with a slight overshoot settle; reduced-motion drops
 * the overshoot for a plain ease-in-out.
 */
function enterMotion(p, reduced) {
  if (p >= ENTER[1]) return { x: 0 }
  const raw = rangeProgress(p, ENTER[0], ENTER[1])
  const t = reduced ? easeInOutCubic(raw) : easeOutBack(raw)
  // Map eased t through 100→0; t may exceed 1 briefly (overshoot past settle).
  return { x: lerp(100, 0, t) }
}

function Solutions() {
  const reduced = useReducedMotion()

  return (
    <PinnedStage
      className={styles.section}
      ariaLabel="Solutions"
      height={`calc(100vh + ${PIN_TRACK_VH}vh)`}
      overlapVh={100}
      startOffsetVh={0}
    >
      {({ progress, isPinned }) => {
        if (!isPinned) {
          return <StackedFallback />
        }

        const p = clamp(progress, 0, 1)
        const layers = layerMotion(p, reduced)
        const copies = copyOpacities(p)
        const enter = enterMotion(p, reduced)

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
              style={{ transform: `translateX(${enter.x}%)` }}
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
