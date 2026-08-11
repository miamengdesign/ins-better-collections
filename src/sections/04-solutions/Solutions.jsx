import CardNav from '../../components/CardNav'
import GradientStage from '../../components/GradientStage'
import PhoneMockup from '../../components/PhoneMockup'
import PinnedStage from '../../components/PinnedStage'
import Stage from '../../components/Stage'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { img } from '../../lib/assets'
import { useHandoff03to04 } from '../../lib/handoff03to04'
import { useSolutionsPushT } from '../../lib/handoff04to05'
import {
  clamp,
  easeInOutCubic,
  easeInOutQuint,
  easeOutQuart,
  lerp,
  rangeProgress,
} from '../../lib/motion'
import styles from './Solutions.module.css'

/**
 * Cinematic anchors (after §03→04 handoff has delivered sol1):
 *  0    — sol1 settled (handoff-driven entrance may still be finishing)
 *  0.33 — sol2
 *  0.66 — sol3
 *  1    — §04→05 push complete
 *
 * Arrows step among 0–2 only. Scroll also runs the push exit.
 */
const ANCHORS = [0, 0.33, 0.66, 1]
const DURATIONS = [1100, 1100, 1300]

const PIN_TRACK_VH = 220

const FADE_12 = [0.12, 0.28]
const FADE_23 = [0.45, 0.61]
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

/**
 * §03→04 entrance from shared handoff T (gradient stationary):
 *  0.35–0.55  upper text fades in
 *  0.50–0.75  light card enters from the right (soft settle)
 *  0.70–1.00  mockup content fades in
 */
function handoffEnterMotion(t, reduced) {
  const textT = easeInOutQuint(rangeProgress(t, 0.35, 0.55))
  const cardT = reduced
    ? rangeProgress(t, 0.5, 0.75)
    : easeOutQuart(rangeProgress(t, 0.5, 0.75))
  const mockT = easeInOutQuint(rangeProgress(t, 0.7, 1))
  return {
    textOpacity: textT,
    panelX: lerp(100, 0, cardT),
    mockOpacity: mockT,
  }
}

/** In-place phone content crossfade — no translate/drift. */
function layerMotion(p) {
  if (p < FADE_12[0]) {
    return [{ opacity: 1 }, { opacity: 0 }, { opacity: 0 }]
  }
  if (p < FADE_12[1]) {
    const t = easeInOutCubic(rangeProgress(p, FADE_12[0], FADE_12[1]))
    return [{ opacity: 1 - t }, { opacity: t }, { opacity: 0 }]
  }
  if (p < FADE_23[0]) {
    return [{ opacity: 0 }, { opacity: 1 }, { opacity: 0 }]
  }
  if (p < FADE_23[1]) {
    const t = easeInOutCubic(rangeProgress(p, FADE_23[0], FADE_23[1]))
    return [{ opacity: 0 }, { opacity: 1 - t }, { opacity: t }]
  }
  return [{ opacity: 0 }, { opacity: 0 }, { opacity: 1 }]
}

function copyOpacities(p) {
  return layerMotion(p).map((l) => l.opacity)
}

function panelPushX(p, sharedPushT) {
  if (sharedPushT > 0.001) return lerp(0, 100, sharedPushT)
  if (p >= PUSH[0]) {
    return lerp(0, 100, easeInOutQuint(rangeProgress(p, PUSH[0], PUSH[1])))
  }
  return 0
}

function Solutions({ phase1Static = false } = {}) {
  const reduced = useReducedMotion()
  const handoffT = useHandoff03to04()
  const sharedPushT = useSolutionsPushT()

  if (phase1Static) {
    return (
      <Stage className={styles.section} aria-label="Solutions">
        <StackedFallback />
      </Stage>
    )
  }

  return (
    <PinnedStage
      className={styles.section}
      ariaLabel="Solutions"
      height={`calc(100vh + ${PIN_TRACK_VH}vh)`}
      overlapVh={100}
      startOffsetVh={0}
      style={{ zIndex: handoffT >= 0.999 ? 2 : 0 }}
      cinematic={{
        anchors: ANCHORS,
        durations: DURATIONS,
        duration: 1100,
        reduced,
      }}
    >
      {({ progress, isPinned, stepIndex, goToStep, animating }) => {
        if (!isPinned) {
          return <StackedFallback />
        }

        const p = clamp(progress, 0, 1)
        const enter = handoffEnterMotion(handoffT, reduced)
        const entering = handoffT < 0.999
        const layers = layerMotion(p)
        const copies = copyOpacities(p)
        const pushX = panelPushX(p, sharedPushT)
        const panelX = entering ? enter.panelX : pushX

        const textOpacity = entering
          ? enter.textOpacity
          : copies[dominantCopy(p)]
        const mockGate = entering ? enter.mockOpacity : 1

        const inPush = p > PUSH[0]
        const canPrev = stepIndex > 0 && stepIndex <= 2 && !animating && !entering && !inPush
        const canNext = stepIndex < 2 && !animating && !entering && !inPush
        const showNav = !entering && !inPush && stepIndex >= 0 && stepIndex <= 2

        return (
          <>
            <GradientStage />

            <div className={styles.left}>
              {STATES.map((state, i) => {
                const op = entering
                  ? i === 0
                    ? textOpacity
                    : 0
                  : copies[i]
                return (
                  <div
                    key={state.id}
                    className={styles.copyLayer}
                    style={{ opacity: op }}
                    aria-hidden={op < 0.5}
                  >
                    <p className={styles.eyebrow}>{state.eyebrow}</p>
                    <h2 className={styles.heading}>{state.heading}</h2>
                    <div className={styles.badgeGroup}>
                      <span className={styles.badge}>{state.badge}</span>
                      <p className={styles.explanation}>{state.explanation}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div
              className={styles.right}
              style={{ transform: `translateX(${panelX}%)` }}
            >
              {STATES.map((state, i) => (
                <div
                  key={state.id}
                  className={styles.mockupLayer}
                  style={{
                    opacity: layers[i].opacity * mockGate,
                    pointerEvents:
                      layers[i].opacity * mockGate > 0.5 ? 'auto' : 'none',
                  }}
                  aria-hidden={layers[i].opacity * mockGate < 0.05}
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

              {showNav && (
                <CardNav
                  onPrev={() => goToStep(stepIndex - 1)}
                  onNext={() => goToStep(stepIndex + 1)}
                  disablePrev={!canPrev}
                  disableNext={!canNext}
                />
              )}
            </div>
          </>
        )
      }}
    </PinnedStage>
  )
}

function dominantCopy(p) {
  const ops = copyOpacities(p)
  let best = 0
  for (let i = 1; i < ops.length; i += 1) {
    if (ops[i] > ops[best]) best = i
  }
  return best
}

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
