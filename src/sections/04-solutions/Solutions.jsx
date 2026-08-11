import GradientStage from '../../components/GradientStage'
import PhoneMockup from '../../components/PhoneMockup'
import Stage from '../../components/Stage'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { img } from '../../lib/assets'
import {
  easeInOutQuint,
  easeOutQuart,
  lerp,
  rangeProgress,
} from '../../lib/motion'
import { SCENE_INDEX } from '../../nav/scenes'
import { useSceneBlend } from '../../nav/useNavigator'
import styles from './Solutions.module.css'

/**
 * Phase-1: §03→04 entrance + settled Solution 01 only.
 * Internal states 2–3 and §04→05 remain for a later migration.
 */

const STATE_1 = {
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
}

const STATES_STATIC = [
  STATE_1,
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

const CE_3 = SCENE_INDEX['ce-3']
const SOL_1 = SCENE_INDEX['sol-1']

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

function entrancePresence(blend) {
  if (blend.settled) {
    return blend.sceneIndex >= SOL_1 ? 1 : 0
  }
  if (blend.from === CE_3 && blend.to === SOL_1) return blend.t
  if (blend.from === SOL_1 && blend.to === CE_3) return 1 - blend.t
  if (blend.to >= SOL_1 || blend.from >= SOL_1) return 1
  return 0
}

function Solutions({ phase1Static = false } = {}) {
  const isMobile = useMediaQuery('(max-width: 767px)')
  const reduced = useReducedMotion()
  const blend = useSceneBlend()

  if (isMobile || phase1Static) {
    return (
      <Stage className={styles.section} aria-label="Solutions">
        <StackedFallback />
      </Stage>
    )
  }

  const presence = entrancePresence(blend)
  const involved =
    presence > 0.001 ||
    (!blend.settled && (blend.to === SOL_1 || blend.from === SOL_1))

  if (!involved) {
    return null
  }

  const motion = entranceFromPresence(presence, reduced)

  return (
    <section
      className={styles.phaseLayer}
      aria-label="Solutions"
      style={{
        pointerEvents: presence > 0.55 ? 'auto' : 'none',
      }}
      aria-hidden={presence < 0.05}
    >
      {/* Gradient: SharedStageBackground — content choreography only. */}

      <div
        className={styles.left}
        style={{ opacity: motion.textOpacity }}
      >
        <div className={styles.copyLayer} style={{ opacity: 1 }}>
          <p className={styles.eyebrow}>{STATE_1.eyebrow}</p>
          <h2 className={styles.heading}>{STATE_1.heading}</h2>
          <div className={styles.badgeGroup}>
            <span className={styles.badge}>{STATE_1.badge}</span>
            <p className={styles.explanation}>{STATE_1.explanation}</p>
          </div>
        </div>
      </div>

      <div
        className={styles.right}
        style={{
          transform: `translate3d(${motion.panelX}%, 0, 0)`,
        }}
      >
        <div
          className={styles.mockupLayer}
          style={{ opacity: motion.mockOpacity }}
          aria-hidden={motion.mockOpacity < 0.05}
        >
          <div className={styles.mockup}>
            <PhoneMockup
              className={styles.phone}
              src={STATE_1.src}
              alt={STATE_1.alt}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function StackedFallback() {
  return (
    <div className={styles.stacked}>
      {STATES_STATIC.map((state) => (
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
