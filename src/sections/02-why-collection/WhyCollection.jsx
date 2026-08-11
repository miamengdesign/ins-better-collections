import GradientStage from '../../components/GradientStage'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import {
  easeInOutQuint,
  easeOutCubic,
  lerp,
  rangeProgress,
} from '../../lib/motion'
import { SCENE_INDEX } from '../../nav/scenes'
import { useSceneBlend } from '../../nav/useNavigator'
import styles from './WhyCollection.module.css'

/**
 * Narrative copy — order matches `02 Why Collections 2/3/4/6` references.
 */
const STATEMENTS = [
  <>
    Collections sit between <strong>personal organization</strong> and{' '}
    <strong>social discovery</strong>.
  </>,
  <>
    People save posts and Reels for <strong>travel ideas</strong>,{' '}
    <strong>recipes</strong>, shopping <strong>references</strong> and{' '}
    <strong>inspiration</strong>.
  </>,
  <>
    Yet the current experience treats saving and collaboration as{' '}
    <strong>separate</strong>, <strong>inconsistent</strong> actions.
  </>,
  <>
    I focused on improving the <strong>complete Collection journey</strong> rather
    than redesigning Instagram&apos;s broader content experience.
  </>,
]

/**
 * Geometry from `references/svg/02 Why Collections {2,3,4}.svg` (1728×1117).
 */
const GEO = {
  previousTop: (187.9 / 1117) * 100,
  activeTop: (592.9 / 1117) * 100,
  enterTop: (592.9 / 1117) * 100 + 8,
  dismissTop: (187.9 / 1117) * 100 - 5,
  activeFont: 48,
  previousFont: 24,
  enterFont: 48 * 0.72,
  dismissFont: 24 * 0.88,
  activeOpacity: 1,
  previousOpacity: 0.38,
  enterOpacity: 0,
  dismissOpacity: 0,
}

const WHY_TITLE = SCENE_INDEX['why-title']
const WHY_1 = SCENE_INDEX['why-1']
const WHY_4 = SCENE_INDEX['why-4']
const CE_1 = SCENE_INDEX['ce-1']

function mix(a, b, t) {
  return {
    top: lerp(a.top, b.top, t),
    font: lerp(a.font, b.font, t),
    opacity: lerp(a.opacity, b.opacity, t),
  }
}

const ACTIVE = {
  top: GEO.activeTop,
  font: GEO.activeFont,
  opacity: GEO.activeOpacity,
}
const PREVIOUS = {
  top: GEO.previousTop,
  font: GEO.previousFont,
  opacity: GEO.previousOpacity,
}
const ENTER = {
  top: GEO.enterTop,
  font: GEO.enterFont,
  opacity: GEO.enterOpacity,
}
const DISMISS = {
  top: GEO.dismissTop,
  font: GEO.dismissFont,
  opacity: GEO.dismissOpacity,
}

/** Map navigator blend → continuous statement index progress in [0..4]. */
function whyProgress(blend) {
  // -1 = not in why yet; 0 = title only; 1..4 = statements
  if (blend.settled) {
    if (blend.sceneIndex < WHY_TITLE) return -1
    if (blend.sceneIndex === WHY_TITLE) return 0
    if (blend.sceneIndex >= CE_1) return 4.999
    if (blend.sceneIndex >= WHY_1 && blend.sceneIndex <= WHY_4) {
      return blend.sceneIndex - WHY_TITLE
    }
    return -1
  }

  const { from, to, t } = blend
  const e = easeInOutQuint(t)

  // Hero ↔ why-title
  if (
    (from < WHY_TITLE && to === WHY_TITLE) ||
    (from === WHY_TITLE && to < WHY_TITLE)
  ) {
    const forward = to === WHY_TITLE
    return forward ? lerp(-1, 0, e) : lerp(0, -1, e)
  }

  // why-title ↔ why-1 … why-4 pairwise
  if (from >= WHY_TITLE && to >= WHY_TITLE && from <= WHY_4 && to <= WHY_4) {
    const fromP = from === WHY_TITLE ? 0 : from - WHY_TITLE
    const toP = to === WHY_TITLE ? 0 : to - WHY_TITLE
    return lerp(fromP, toP, e)
  }

  // why-4 ↔ ce-1 handoff: keep statement 4 visible then fade via stage opacity
  if (
    (from === WHY_4 && to === CE_1) ||
    (from === CE_1 && to === WHY_4)
  ) {
    return 4
  }

  if (to >= CE_1 || from >= CE_1) return 4.999
  if (to < WHY_TITLE && from < WHY_TITLE) return -1
  return 0
}

function headingTFromProgress(p, reduced) {
  if (p <= 0) return 0
  if (p >= 1) return 1
  // Demote heading while statement 1 enters (0 → 1).
  const raw = rangeProgress(p, 0, 1)
  return reduced ? raw : easeInOutQuint(raw)
}

function statementStyle(p, index, reduced) {
  // p: 0 = title only; 1 = stmt1 active; 2 = stmt2 active; …
  const enterAt = index + 0 // stmt0 enters as p goes 0→1
  const activeAt = index + 1
  const previousAt = index + 2
  const dismissAt = index + 3

  if (p <= enterAt) return { ...ENTER, phase: 'pending' }

  if (p < activeAt) {
    const raw = rangeProgress(p, enterAt, activeAt)
    const t = reduced ? raw : easeOutCubic(raw)
    if (reduced) return { ...ACTIVE, opacity: t, phase: 'entering' }
    return { ...mix(ENTER, ACTIVE, t), phase: 'entering' }
  }

  if (p < previousAt) {
    // Hold active until next statement begins, then move to previous slot.
    const handoffEnd = previousAt
    // Active hold occupies first half of the unit interval after activeAt…
    // Actually when p is between activeAt and previousAt, we're transitioning
    // to previous as the next statement enters.
    const raw = rangeProgress(p, activeAt, handoffEnd)
    const t = reduced ? raw : easeInOutQuint(raw)
    if (reduced) {
      return {
        ...PREVIOUS,
        opacity: lerp(ACTIVE.opacity, PREVIOUS.opacity, t),
        phase: 'to-previous',
      }
    }
    return { ...mix(ACTIVE, PREVIOUS, t), phase: 'to-previous' }
  }

  if (p < dismissAt) {
    return { ...PREVIOUS, phase: 'previous' }
  }

  if (index === STATEMENTS.length - 1) {
    // Final statement stays as previous until handoff fades the stage.
    return { ...PREVIOUS, phase: 'previous' }
  }

  const raw = rangeProgress(p, dismissAt, dismissAt + 1)
  const t = reduced ? raw : easeInOutQuint(raw)
  if (reduced) {
    return {
      ...DISMISS,
      opacity: lerp(PREVIOUS.opacity, DISMISS.opacity, t),
      phase: 'dismissing',
    }
  }
  return { ...mix(PREVIOUS, DISMISS, t), phase: 'dismissing' }
}

/** Stage opacity during §02→03 handoff (why copy leaves). */
function stageOpacity(blend) {
  if (blend.settled) {
    return blend.sceneIndex >= CE_1 ? 0 : blend.sceneIndex >= WHY_TITLE ? 1 : 0
  }
  if (blend.from === WHY_4 && blend.to === CE_1) {
    // Fade why early in the handoff (0–0.28 of timeline).
    return 1 - easeInOutQuint(rangeProgress(blend.t, 0, 0.28))
  }
  if (blend.from === CE_1 && blend.to === WHY_4) {
    return easeInOutQuint(rangeProgress(blend.t, 0.72, 1))
  }
  if (blend.from < WHY_TITLE && blend.to === WHY_TITLE) {
    return easeInOutQuint(rangeProgress(blend.t, 0.35, 1))
  }
  if (blend.from === WHY_TITLE && blend.to < WHY_TITLE) {
    return 1 - easeInOutQuint(rangeProgress(blend.t, 0, 0.65))
  }
  if (blend.to < WHY_TITLE && blend.from < WHY_TITLE) return 0
  if (blend.to >= CE_1 && blend.from >= CE_1) return 0
  return 1
}

function WhyCollection() {
  const isMobile = useMediaQuery('(max-width: 767px)')
  const reduced = useReducedMotion()
  const blend = useSceneBlend()

  if (isMobile) {
    return (
      <section className={styles.sectionFlow} aria-label="Why Collection">
        <StackedFallback />
      </section>
    )
  }

  const p = whyProgress(blend)
  const opacity = stageOpacity(blend)
  const headingT = headingTFromProgress(Math.max(p, 0), reduced)
  const show = opacity > 0.001 || (!blend.settled && blend.to >= WHY_TITLE)

  if (!show && blend.settled && blend.sceneIndex < WHY_TITLE) {
    return null
  }

  return (
    <section
      className={styles.layer}
      aria-label="Why Collection"
      style={{ opacity, pointerEvents: opacity < 0.05 ? 'none' : 'auto' }}
      aria-hidden={opacity < 0.05}
    >
      <GradientStage className={styles.gradient} />

      <h2
        className={styles.heading}
        style={{
          '--heading-t': headingT,
        }}
      >
        Why Collection?
      </h2>

      {STATEMENTS.map((copy, i) => {
        const motion =
          p < 0
            ? { ...ENTER, phase: 'pending' }
            : statementStyle(p, i, reduced)

        return (
          <p
            key={i}
            className={styles.statement}
            style={{
              opacity: motion.opacity,
              top: `${motion.top}cqh`,
              fontSize: `${(motion.font / 1728) * 100}cqw`,
              pointerEvents: 'none',
            }}
            aria-hidden={motion.opacity < 0.05}
            data-phase={motion.phase}
          >
            {copy}
          </p>
        )
      })}
    </section>
  )
}

function StackedFallback() {
  return (
    <div className={styles.stacked}>
      <GradientStage className={styles.gradient} />
      <h2 className={styles.stackedHeading}>Why Collection?</h2>
      {STATEMENTS.map((copy, i) => (
        <p key={i} className={styles.stackedStatement}>
          {copy}
        </p>
      ))}
    </div>
  )
}

export default WhyCollection
