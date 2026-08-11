import CardNav from '../../components/CardNav'
import GradientStage from '../../components/GradientStage'
import PhoneMockup from '../../components/PhoneMockup'
import Stage from '../../components/Stage'
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
import styles from './Solutions.module.css'

/**
 * §04 Solutions — entrance from ce-3, internal states 1→2→3, exit push to §05.
 * Light card + phone body stay fixed during internals; §04→05 is a physical push.
 */

/**
 * Phone-body alignment within each composite PNG (measured):
 * dense opaque phone columns are 37..1686 (1650px) on every asset; canvases
 * differ only because callouts extend further right. Trim so the phone body
 * maps to one shared stage rectangle.
 */
const PHONE_BODY_LEFT = 37
const PHONE_BODY_WIDTH = 1650
/** Sol-1 canvas height — stage aspect uses this so sol-1 size is unchanged. */
const PHONE_STAGE_HEIGHT = 3657

const STATES = [
  {
    id: 'sol1',
    eyebrow: 'Solution 01',
    heading: 'Reels Detail Enhancement',
    badge: '✅ Interface Consistency',
    explanation: (
      <>
        Users can easily find the <strong>Collection option</strong> in the Reel{' '}
        <strong>detail view</strong>, keeping the experience{' '}
        <strong>consistent</strong> across all content formats.
      </>
    ),
    src: img('04 Solution asset/04 Solution 1 pic.png'),
    alt: 'Reel detail view with a Collection save option',
    canvasWidth: 2420,
  },
  {
    id: 'sol2',
    eyebrow: 'Solution 02',
    heading: 'New Collection Enhancement',
    badge: '✅ Multi-User Collaboration',
    explanation: (
      <>
        Users can now create a new collection and <strong>share</strong> it with{' '}
        <strong>multiple</strong> friends. The <strong>selection count</strong>{' '}
        helps them clearly see how many people are added.
      </>
    ),
    src: img('04 Solution asset/04 Solution 2 pic.png'),
    alt: 'New collection flow with multi-friend selection',
    canvasWidth: 2544,
  },
  {
    id: 'sol3',
    eyebrow: 'Solution 03',
    heading: 'Manage Collection Enhancement',
    badge: '✅ Collaboration Consistency',
    explanation: (
      <>
        Sharing an <strong>existing</strong> collection is now simple—users can
        view current collaborators and <strong>add new ones</strong> whenever they
        like.
      </>
    ),
    src: img('04 Solution asset/04 Solution 3 pic.png'),
    alt: 'Manage collection share sheet with collaborators',
    canvasWidth: 2672,
  },
]

const CE_3 = SCENE_INDEX['ce-3']
const SOL_1 = SCENE_INDEX['sol-1']
const SOL_3 = SCENE_INDEX['sol-3']
const PROTO = SCENE_INDEX['proto']

/** 0..2 for Solutions states; -1 outside. */
function stateIndexForScene(sceneIndex) {
  if (sceneIndex >= SOL_1 && sceneIndex <= SOL_3) return sceneIndex - SOL_1
  return -1
}

/**
 * §03→04 entrance presence 0→1 (reverse via 1−t). Gradient stays put.
 *
 *  Phase A–B  0.00–0.42  §03 card exit + upper fade (owned by CE)
 *  Phase C    0.38–0.55  §04 upper content fades in (static position)
 *  Phase D    0.52–0.78  §04 light card enters from the right (ease-out)
 *  Phase E    0.72–1.00  mockup / card content fades in after settle
 */
function entranceFromPresence(presence, reduced) {
  const textT = easeInOutQuint(rangeProgress(presence, 0.38, 0.55))
  const cardT = reduced
    ? rangeProgress(presence, 0.52, 0.78)
    : easeOutQuart(rangeProgress(presence, 0.52, 0.78))
  const mockT = easeInOutQuint(rangeProgress(presence, 0.72, 1))
  return {
    textOpacity: textT,
    panelX: reduced ? 0 : lerp(100, 0, cardT),
    mockOpacity: mockT,
  }
}

function isEntranceHandoff(blend) {
  if (blend.settled) return false
  return (
    (blend.from === CE_3 && blend.to === SOL_1) ||
    (blend.from === SOL_1 && blend.to === CE_3)
  )
}

function isProtoHandoff(blend) {
  if (blend.settled) return false
  return (
    (blend.from === SOL_3 && blend.to === PROTO) ||
    (blend.from === PROTO && blend.to === SOL_3)
  )
}

/** 0 = fully on §04, 1 = fully pushed off for §05. Shared with Prototype. */
function protoPushT(blend) {
  if (blend.settled) {
    return blend.sceneIndex >= PROTO ? 1 : 0
  }
  if (blend.from === SOL_3 && blend.to === PROTO) return blend.t
  if (blend.from === PROTO && blend.to === SOL_3) return 1 - blend.t
  if (blend.to >= PROTO || blend.from >= PROTO) return 1
  return 0
}

function isInternalSol(blend) {
  if (blend.settled) return false
  return (
    blend.from >= SOL_1 &&
    blend.from <= SOL_3 &&
    blend.to >= SOL_1 &&
    blend.to <= SOL_3 &&
    blend.from !== blend.to
  )
}

function entrancePresence(blend) {
  if (isProtoHandoff(blend)) {
    // Fully entered while the physical push owns leave / return.
    return 1
  }
  if (blend.settled) {
    return blend.sceneIndex >= SOL_1 && blend.sceneIndex <= SOL_3 ? 1 : 0
  }
  if (blend.from === CE_3 && blend.to === SOL_1) return blend.t
  if (blend.from === SOL_1 && blend.to === CE_3) return 1 - blend.t
  if (
    (blend.from >= SOL_1 && blend.from <= SOL_3) ||
    (blend.to >= SOL_1 && blend.to <= SOL_3)
  ) {
    return 1
  }
  return 0
}

/**
 * §04→05 push owns panel X (locked with Prototype). Copy fades after push starts.
 */
function stageMotion(blend, reduced) {
  const presence = entrancePresence(blend)
  const enter = entranceFromPresence(presence, reduced)
  const push = protoPushT(blend)

  if (push > 0.001) {
    const pushEased = reduced ? push : easeInOutQuint(push)
    const copyFade = easeInOutQuint(rangeProgress(push, 0.12, 0.42))
    return {
      textOpacity: enter.textOpacity * (1 - copyFade),
      panelX: lerp(0, 100, pushEased),
      mockOpacity: enter.mockOpacity,
    }
  }

  return enter
}

/**
 * At most two content layers — exiting + incoming — never a historical stack.
 */
function contentRelay(blend, reduced) {
  if (blend.settled) {
    const idx = stateIndexForScene(blend.sceneIndex)
    if (idx < 0) return []
    return [{ index: idx, opacity: 1, role: 'current' }]
  }

  // §03→04 entrance / reverse: only State 1, gated by entrance opacities.
  if (isEntranceHandoff(blend)) {
    return [{ index: 0, opacity: 1, role: 'current' }]
  }

  // §04→05 push / reverse: hold State 3 (physical panel motion owns leave).
  if (isProtoHandoff(blend)) {
    return [{ index: 2, opacity: 1, role: 'current' }]
  }

  if (isInternalSol(blend)) {
    const fromIdx = stateIndexForScene(blend.from)
    const toIdx = stateIndexForScene(blend.to)
    const t = reduced ? blend.t : easeInOutCubic(blend.t)
    return [
      { index: fromIdx, opacity: 1 - t, role: 'exiting' },
      { index: toIdx, opacity: t, role: 'incoming' },
    ]
  }

  const idx = stateIndexForScene(
    blend.to >= SOL_1 && blend.to <= SOL_3 ? blend.to : blend.from,
  )
  if (idx < 0) return []
  return [{ index: idx, opacity: 1, role: 'current' }]
}

function Solutions({ phase1Static = false } = {}) {
  const isMobile = useMediaQuery('(max-width: 767px)')
  const reduced = useReducedMotion()
  const blend = useSceneBlend()
  const { animating, sceneIndex } = useNavigator()

  if (isMobile || phase1Static) {
    return (
      <Stage className={styles.section} aria-label="Solutions">
        <StackedFallback />
      </Stage>
    )
  }

  const presence = entrancePresence(blend)
  const push = protoPushT(blend)
  const involved =
    isProtoHandoff(blend) ||
    (presence > 0.001 && push < 0.999) ||
    (!blend.settled &&
      ((blend.to >= SOL_1 && blend.to <= SOL_3) ||
        (blend.from >= SOL_1 && blend.from <= SOL_3)))

  if (!involved || (push >= 0.999 && blend.settled)) {
    return null
  }

  const motion = stageMotion(blend, reduced)
  const layers = contentRelay(blend, reduced)

  const onSolStage =
    blend.settled && sceneIndex >= SOL_1 && sceneIndex <= SOL_3
  const inInternal = isInternalSol(blend)
  const showNav =
    presence > 0.95 &&
    push < 0.001 &&
    motion.panelX < 0.5 &&
    (onSolStage || inInternal) &&
    !isEntranceHandoff(blend) &&
    !isProtoHandoff(blend)
  const stateIdx = onSolStage
    ? stateIndexForScene(sceneIndex)
    : inInternal
      ? stateIndexForScene(blend.to)
      : 0

  return (
    <section
      className={styles.phaseLayer}
      aria-label="Solutions"
      style={{
        pointerEvents: presence > 0.55 && push < 0.5 ? 'auto' : 'none',
      }}
      aria-hidden={presence < 0.05 || push > 0.95}
    >
      {/* Gradient: SharedStageBackground — content choreography only. */}

      <div
        className={styles.left}
        style={{ opacity: motion.textOpacity }}
      >
        {layers.map(({ index, opacity, role }) => {
          const state = STATES[index]
          return (
            <div
              key={state.id}
              className={styles.copyLayer}
              data-role={role}
              style={{ opacity }}
              aria-hidden={opacity < 0.5}
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
        style={{
          transform: `translate3d(${motion.panelX}%, 0, 0)`,
        }}
      >
        <div
          className={styles.mockupStage}
          style={{
            opacity: motion.mockOpacity,
            aspectRatio: `${PHONE_BODY_WIDTH} / ${PHONE_STAGE_HEIGHT}`,
          }}
          aria-hidden={motion.mockOpacity < 0.05}
        >
          {layers.map(({ index, opacity, role }) => {
            const state = STATES[index]
            const trimX = PHONE_BODY_LEFT / state.canvasWidth
            return (
              <div
                key={state.id}
                className={styles.mockupLayer}
                data-role={role}
                style={{ opacity }}
                aria-hidden={opacity < 0.05}
              >
                <PhoneMockup
                  className={styles.phone}
                  src={state.src}
                  alt={state.alt}
                  style={{
                    '--phone-trim-x': String(trimX),
                  }}
                />
              </div>
            )
          })}
        </div>

        {showNav && (
          <CardNav
            onPrev={() => goPrev({ reduced })}
            onNext={() => goNext({ reduced })}
            disablePrev={animating || stateIdx <= 0}
            /* State 3 next advances into §04→05 via the same goNext path. */
            disableNext={animating}
          />
        )}
      </div>
    </section>
  )
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
            <div
              className={styles.mockupStage}
              style={{
                aspectRatio: `${PHONE_BODY_WIDTH} / ${PHONE_STAGE_HEIGHT}`,
              }}
            >
              <div className={styles.mockupLayer}>
                <PhoneMockup
                  className={styles.phone}
                  src={state.src}
                  alt={state.alt}
                  style={{
                    '--phone-trim-x': String(
                      PHONE_BODY_LEFT / state.canvasWidth,
                    ),
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Solutions
