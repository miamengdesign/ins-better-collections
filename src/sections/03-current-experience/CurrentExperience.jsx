import CalloutCard from '../../components/CalloutCard'
import CardNav from '../../components/CardNav'
import GradientStage from '../../components/GradientStage'
import PhoneMockup from '../../components/PhoneMockup'
import StepTracker from '../../components/StepTracker'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { img } from '../../lib/assets'
import {
  easeInOutCubic,
  easeInOutQuint,
  easeOutQuart,
  lerp,
  rangeProgress,
} from '../../lib/motion'
import { goNext, goPrev } from '../../nav/navigatorStore'
import { SCENE_INDEX } from '../../nav/scenes'
import { useNavigator, useSceneBlend } from '../../nav/useNavigator'
import styles from './CurrentExperience.module.css'

/**
 * §03 Current Experience — entrance from why-4, then internal states 1→2→3.
 * Panel geometry stays fixed during internal relays (opacity crossfade only).
 */

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

const WHY_4 = SCENE_INDEX['why-4']
const CE_1 = SCENE_INDEX['ce-1']
const CE_3 = SCENE_INDEX['ce-3']

/** 0..2 for CE states; -1 outside CE. */
function stateIndexForScene(sceneIndex) {
  if (sceneIndex >= CE_1 && sceneIndex <= CE_3) return sceneIndex - CE_1
  return -1
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

const EVIDENCE = [EvidenceState1, EvidenceState2, EvidenceState3]

/**
 * Single §02→03 presence timeline (presence 0→1 enter, 1→0 exit via 1−t).
 * Gradient is SharedStageBackground — never animated here.
 *
 *  Phase A  0.00–0.22  why content fade (owned by WhyCollection)
 *  Phase B  0.22–0.42  CE upper content fades in (title / tracker / bullet)
 *  Phase C  0.42–0.52  short visual pause
 *  Phase D  0.52–0.78  light evidence card rises (ease-out, no bounce)
 *  Phase E  0.78–1.00  mockups + callout fade in after card is settled
 */
function entranceFromPresence(presence, reduced) {
  const headerT = easeInOutQuint(rangeProgress(presence, 0.22, 0.42))
  const cardT = reduced
    ? rangeProgress(presence, 0.52, 0.78)
    : easeOutQuart(rangeProgress(presence, 0.52, 0.78))
  const contentT = easeInOutQuint(rangeProgress(presence, 0.78, 1))
  const cardRising = presence >= 0.52

  return {
    headerOpacity: headerT,
    panelY: reduced ? 0 : lerp(36, 0, cardT),
    panelOpacity: cardRising ? lerp(0.2, 1, Math.max(cardT, 0.001)) : 0,
    contentOpacity: contentT,
  }
}

/** Presence: 0 = pre-entrance, 1 = fully on stage (any CE state). */
function entrancePresence(blend) {
  if (blend.settled) {
    return blend.sceneIndex >= CE_1 && blend.sceneIndex <= CE_3 ? 1 : 0
  }
  if (blend.from === WHY_4 && blend.to === CE_1) return blend.t
  if (blend.from === CE_1 && blend.to === WHY_4) return 1 - blend.t
  if (
    (blend.from >= CE_1 && blend.from <= CE_3) ||
    (blend.to >= CE_1 && blend.to <= CE_3)
  ) {
    return 1
  }
  return 0
}

function isWhyHandoff(blend) {
  return (
    (!blend.settled &&
      ((blend.from === WHY_4 && blend.to === CE_1) ||
        (blend.from === CE_1 && blend.to === WHY_4))) ||
    false
  )
}

function isInternalCe(blend) {
  if (blend.settled) return false
  return (
    blend.from >= CE_1 &&
    blend.from <= CE_3 &&
    blend.to >= CE_1 &&
    blend.to <= CE_3 &&
    blend.from !== blend.to
  )
}

/**
 * At most two evidence layers — exiting + incoming — never a historical stack.
 */
function evidenceRelay(blend, reduced) {
  if (blend.settled) {
    const idx = stateIndexForScene(blend.sceneIndex)
    if (idx < 0) return []
    return [{ index: idx, opacity: 1, role: 'current' }]
  }

  // §02→03 entrance / reverse: only State 1, gated by entrance contentOpacity.
  if (isWhyHandoff(blend)) {
    return [{ index: 0, opacity: 1, role: 'current' }]
  }

  if (isInternalCe(blend)) {
    const fromIdx = stateIndexForScene(blend.from)
    const toIdx = stateIndexForScene(blend.to)
    const t = reduced ? blend.t : easeInOutCubic(blend.t)
    return [
      { index: fromIdx, opacity: 1 - t, role: 'exiting' },
      { index: toIdx, opacity: t, role: 'incoming' },
    ]
  }

  const idx = stateIndexForScene(
    blend.to >= CE_1 && blend.to <= CE_3 ? blend.to : blend.from,
  )
  if (idx < 0) return []
  return [{ index: idx, opacity: 1, role: 'current' }]
}

function bulletRelay(blend, reduced) {
  return evidenceRelay(blend, reduced).map(({ index, opacity, role }) => ({
    index,
    opacity,
    role,
    text: STATES[index].bullet,
  }))
}

function trackerEmphasis(blend, reduced) {
  const settledIdx = stateIndexForScene(blend.sceneIndex)
  if (blend.settled) {
    const state = STATES[Math.max(0, settledIdx)]
    return {
      activeSteps: state.activeSteps,
      dottedAfter: state.dottedAfter,
      emphasis: null,
    }
  }

  if (isWhyHandoff(blend)) {
    return {
      activeSteps: STATES[0].activeSteps,
      dottedAfter: STATES[0].dottedAfter,
      emphasis: null,
    }
  }

  if (isInternalCe(blend)) {
    const fromState = STATES[stateIndexForScene(blend.from)]
    const toState = STATES[stateIndexForScene(blend.to)]
    const t = reduced ? blend.t : easeInOutCubic(blend.t)
    const mix = (step) => {
      const a = fromState.activeSteps.includes(step) ? 1 : 0.5
      const b = toState.activeSteps.includes(step) ? 1 : 0.5
      return lerp(a, b, t)
    }
    // Visual “active” set leans toward the destination after midpoint.
    const activeSteps = t < 0.5 ? fromState.activeSteps : toState.activeSteps
    return {
      activeSteps,
      dottedAfter: toState.dottedAfter,
      emphasis: {
        step: mix,
        connector: (a, b) => {
          const fromOn =
            fromState.activeSteps.includes(a) &&
            fromState.activeSteps.includes(b)
              ? 1
              : 0.5
          const toOn =
            toState.activeSteps.includes(a) && toState.activeSteps.includes(b)
              ? 1
              : 0.5
          return lerp(fromOn, toOn, t)
        },
      },
    }
  }

  const idx = Math.max(0, stateIndexForScene(blend.to))
  return {
    activeSteps: STATES[idx].activeSteps,
    dottedAfter: STATES[idx].dottedAfter,
    emphasis: null,
  }
}

function CurrentExperience() {
  const isMobile = useMediaQuery('(max-width: 767px)')
  const reduced = useReducedMotion()
  const blend = useSceneBlend()
  const { animating, sceneIndex } = useNavigator()
  const presence = entrancePresence(blend)
  const involved =
    presence > 0.001 ||
    (!blend.settled &&
      ((blend.to >= CE_1 && blend.to <= CE_3) ||
        (blend.from >= CE_1 && blend.from <= CE_3)))

  if (isMobile) {
    return (
      <section className={styles.section} aria-label="Current Experience">
        <StackedFallback />
      </section>
    )
  }

  if (!involved) {
    return null
  }

  const motion = entranceFromPresence(presence, reduced)
  const layers = evidenceRelay(blend, reduced)
  const bullets = bulletRelay(blend, reduced)
  const tracker = trackerEmphasis(blend, reduced)

  const onCeStage =
    blend.settled && sceneIndex >= CE_1 && sceneIndex <= CE_3
  const inInternal = isInternalCe(blend)
  const showNav =
    presence > 0.95 && (onCeStage || inInternal) && !isWhyHandoff(blend)
  const stateIdx = onCeStage
    ? stateIndexForScene(sceneIndex)
    : inInternal
      ? stateIndexForScene(blend.to)
      : 0

  return (
    <section
      className={styles.phaseLayer}
      aria-label="Current Experience"
      style={{
        pointerEvents: presence > 0.5 ? 'auto' : 'none',
      }}
      aria-hidden={presence < 0.05}
    >
      {/* Gradient: SharedStageBackground — content choreography only. */}

      <div className={styles.stack}>
        <header
          className={styles.header}
          style={{ opacity: motion.headerOpacity }}
        >
          <h2 className={styles.title}>Current Experience</h2>
          <StepTracker
            activeSteps={tracker.activeSteps}
            dottedAfter={tracker.dottedAfter}
            emphasis={tracker.emphasis}
          />
          <div className={styles.bulletStage} aria-live="polite">
            {bullets.map(({ index, opacity, role, text }) => (
              <p
                key={STATES[index].id}
                className={styles.bullet}
                data-role={role}
                style={{ opacity }}
                aria-hidden={opacity < 0.5}
              >
                {text}
              </p>
            ))}
          </div>
        </header>

        <div
          className={styles.panel}
          style={{
            opacity: motion.panelOpacity,
            transform: `translate3d(0, ${motion.panelY}vh, 0)`,
          }}
        >
          {layers.map(({ index, opacity, role }) => {
            const Evidence = EVIDENCE[index]
            return (
              <div
                key={STATES[index].id}
                className={styles.layer}
                data-role={role}
                style={{
                  opacity: opacity * motion.contentOpacity,
                  pointerEvents:
                    opacity * motion.contentOpacity > 0.5 ? 'auto' : 'none',
                }}
                aria-hidden={opacity * motion.contentOpacity < 0.05}
              >
                <Evidence />
              </div>
            )
          })}

          {showNav && (
            <CardNav
              onPrev={() => goPrev({ reduced })}
              onNext={() => goNext({ reduced })}
              disablePrev={animating || stateIdx <= 0}
              disableNext={animating || stateIdx >= STATES.length - 1}
            />
          )}
        </div>
      </div>
    </section>
  )
}

function StackedFallback() {
  return (
    <div className={styles.stacked}>
      <GradientStage className={styles.stackedBg} />
      {STATES.map((state) => {
        const Evidence = EVIDENCE[STATES.indexOf(state)]
        return (
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
              <Evidence />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default CurrentExperience
