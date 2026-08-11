import CalloutCard from '../../components/CalloutCard'
import GradientStage from '../../components/GradientStage'
import PhoneMockup from '../../components/PhoneMockup'
import StepTracker from '../../components/StepTracker'
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
import styles from './CurrentExperience.module.css'

/**
 * Phase 1: only the §02→03 entrance + settled State 1.
 * Internal states 2–3 and CardNav remain for a later migration.
 */

const STATE_1 = {
  id: 'state1',
  activeSteps: ['Discover', 'Save'],
  dottedAfter: 'Save',
  bullet:
    'Users lose a familiar saving action when moving from feed to detail.',
}

const WHY_4 = SCENE_INDEX['why-4']
const CE_1 = SCENE_INDEX['ce-1']

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

/**
 * §02→03 handoff local timeline t∈[0,1] (gradient stays put):
 *  0.00–0.28  why already fading (owned by WhyCollection)
 *  0.18–0.42  CE header / tracker / bullet fade in
 *  0.42–0.52  short pause
 *  0.52–0.78  light card rises from below
 *  0.72–1.00  mockups / content fade in
 */
function entranceFromHandoff(t, reduced) {
  const headerT = easeInOutQuint(rangeProgress(t, 0.18, 0.42))
  const pauseHold = t >= 0.42
  const cardT = reduced
    ? rangeProgress(t, 0.52, 0.78)
    : easeOutQuart(rangeProgress(t, 0.52, 0.78))
  const contentT = easeInOutQuint(rangeProgress(t, 0.72, 1))
  return {
    headerOpacity: headerT,
    panelY: reduced ? 0 : lerp(48, 0, cardT),
    panelOpacity: pauseHold ? lerp(0.15, 1, Math.max(cardT, 0.001)) : 0,
    contentOpacity: contentT,
  }
}

function handoffT(blend) {
  if (blend.settled) {
    return blend.sceneIndex >= CE_1 ? 1 : 0
  }
  if (blend.from === WHY_4 && blend.to === CE_1) return blend.t
  if (blend.from === CE_1 && blend.to === WHY_4) return 1 - blend.t
  if (blend.to >= CE_1 || blend.from >= CE_1) return 1
  return 0
}

function CurrentExperience() {
  const isMobile = useMediaQuery('(max-width: 767px)')
  const reduced = useReducedMotion()
  const blend = useSceneBlend()
  const t = handoffT(blend)
  const show =
    t > 0.001 ||
    (!blend.settled && (blend.to === CE_1 || blend.from === CE_1))

  if (isMobile) {
    return (
      <section className={styles.section} aria-label="Current Experience">
        <StackedFallback />
      </section>
    )
  }

  if (!show) {
    return null
  }

  const motion = entranceFromHandoff(t, reduced)

  return (
    <section
      className={styles.phaseLayer}
      aria-label="Current Experience"
      style={{
        opacity: t > 0 ? 1 : 0,
        pointerEvents: t > 0.5 ? 'auto' : 'none',
      }}
      aria-hidden={t < 0.05}
    >
      {/* Shared gradient is owned by Why while both overlap; once why is gone
          CE paints its own stationary copy so the tail unlock still looks right. */}
      <GradientStage />

      <div className={styles.stack}>
        <header
          className={styles.header}
          style={{ opacity: motion.headerOpacity }}
        >
          <h2 className={styles.title}>Current Experience</h2>
          <StepTracker
            activeSteps={STATE_1.activeSteps}
            dottedAfter={STATE_1.dottedAfter}
          />
          <div className={styles.bulletStage} aria-live="polite">
            <p className={styles.bullet} style={{ opacity: 1 }}>
              {STATE_1.bullet}
            </p>
          </div>
        </header>

        <div
          className={styles.panel}
          style={{
            opacity: motion.panelOpacity,
            transform: `translateY(${motion.panelY}vh)`,
          }}
        >
          <div
            className={styles.layer}
            style={{ opacity: motion.contentOpacity }}
          >
            <EvidenceState1 />
          </div>
        </div>
      </div>
    </section>
  )
}

function StackedFallback() {
  return (
    <div className={styles.stacked}>
      <GradientStage className={styles.stackedBg} />
      <div className={styles.stackedBlock}>
        <header className={styles.header}>
          <h2 className={styles.title}>Current Experience</h2>
          <StepTracker
            activeSteps={STATE_1.activeSteps}
            dottedAfter={STATE_1.dottedAfter}
          />
          <p className={styles.bulletStatic}>{STATE_1.bullet}</p>
        </header>
        <div className={styles.panelStatic}>
          <EvidenceState1 />
        </div>
      </div>
    </div>
  )
}

export default CurrentExperience
