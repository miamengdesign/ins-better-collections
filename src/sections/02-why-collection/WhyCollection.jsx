import GradientStage from '../../components/GradientStage'
import PinnedStage from '../../components/PinnedStage'
import { HERO_EXIT_VH, HERO_TRACK_VH } from '../../config/layout'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import {
  clamp,
  easeInOutQuint,
  easeOutCubic,
  lerp,
  rangeProgress,
} from '../../lib/motion'
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
 * Enter from slightly below; previous settles upper-left dimmed — never snaps off.
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

/**
 * Progress anchors for cinematic steps (trigger → timeline, not scrub).
 * Final anchor fades the stage out for the §02→03 handoff.
 */
const ANCHORS = [0, 0.12, 0.32, 0.52, 0.72, 0.9, 1]
const DURATIONS = [1000, 1250, 1250, 1250, 1250, 1100]

const WINDOWS = [
  { enter: [0.12, 0.22], activeEnd: 0.32, previousEnd: 0.52, dismissEnd: 0.62 },
  { enter: [0.32, 0.42], activeEnd: 0.52, previousEnd: 0.72, dismissEnd: 0.82 },
  { enter: [0.52, 0.62], activeEnd: 0.72, previousEnd: 0.9, dismissEnd: 0.96 },
  { enter: [0.72, 0.82], activeEnd: 0.9, previousEnd: null, dismissEnd: null },
]

const PIN_TRACK_VH = 280

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

function mix(a, b, t) {
  return {
    top: lerp(a.top, b.top, t),
    font: lerp(a.font, b.font, t),
    opacity: lerp(a.opacity, b.opacity, t),
  }
}

function headingMotion(p, reduced) {
  if (p <= 0.02) return { t: 0 }
  if (p >= 0.12) return { t: 1 }
  const raw = rangeProgress(p, 0.02, 0.12)
  return { t: reduced ? raw : easeInOutQuint(raw) }
}

/**
 * Calm continuous styles for one statement. Previous stays visible in the upper
 * dimmed slot while the next takes focus — no sudden disappearance.
 */
function statementMotion(p, index, reduced) {
  const window = WINDOWS[index]
  const [enterStart, enterEnd] = window.enter
  const { activeEnd, previousEnd, dismissEnd } = window

  if (p < enterStart) {
    return { ...ENTER, phase: 'pending' }
  }

  if (p < enterEnd) {
    const raw = rangeProgress(p, enterStart, enterEnd)
    const t = reduced ? raw : easeOutCubic(raw)
    if (reduced) return { ...ACTIVE, opacity: t, phase: 'entering' }
    return { ...mix(ENTER, ACTIVE, t), phase: 'entering' }
  }

  if (previousEnd == null || p <= activeEnd) {
    return { ...ACTIVE, phase: 'active' }
  }

  const next = WINDOWS[index + 1]
  const handoffEnd = next ? next.enter[1] : activeEnd
  if (p < handoffEnd) {
    const raw = rangeProgress(p, activeEnd, handoffEnd)
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

  if (dismissEnd == null || p <= previousEnd) {
    return { ...PREVIOUS, phase: 'previous' }
  }

  if (p >= dismissEnd) {
    return { ...DISMISS, phase: 'gone' }
  }

  const raw = rangeProgress(p, previousEnd, dismissEnd)
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

/** Stage-wide fade for the §02→03 handoff (last cinematic step). */
function stageExitOpacity(p) {
  if (p < 0.92) return 1
  return 1 - rangeProgress(p, 0.92, 1)
}

function currentStatementIndex(p) {
  if (p < 0.12) return -1
  for (let i = WINDOWS.length - 1; i >= 0; i -= 1) {
    if (p >= WINDOWS[i].enter[0]) return i
  }
  return -1
}

function WhyCollection() {
  const reduced = useReducedMotion()

  return (
    <PinnedStage
      className={styles.section}
      ariaLabel="Why Collection"
      height={`calc(${HERO_TRACK_VH}vh + ${PIN_TRACK_VH}vh)`}
      overlapVh={HERO_TRACK_VH}
      startOffsetVh={HERO_EXIT_VH}
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
        const heading = headingMotion(p, reduced)
        const currentIdx = currentStatementIndex(p)
        const exitOp = stageExitOpacity(p)

        return (
          <>
            <GradientStage className={styles.gradient} />

            <h2
              className={styles.heading}
              style={{
                '--heading-t': heading.t,
                opacity: exitOp,
              }}
            >
              Why Collection?
            </h2>

            {STATEMENTS.map((copy, i) => {
              if (reduced) {
                const isCurrent = i === currentIdx
                const isPrevious = i === currentIdx - 1
                const opacity =
                  (isCurrent ? 1 : isPrevious ? GEO.previousOpacity : 0) * exitOp
                const top = isPrevious ? GEO.previousTop : GEO.activeTop
                const font = isPrevious ? GEO.previousFont : GEO.activeFont
                return (
                  <p
                    key={i}
                    className={styles.statement}
                    style={{
                      opacity,
                      top: `${top}cqh`,
                      fontSize: `${(font / 1728) * 100}cqw`,
                      pointerEvents: 'none',
                    }}
                    aria-hidden={opacity < 0.05}
                  >
                    {copy}
                  </p>
                )
              }

              const motion = statementMotion(p, i, false)

              return (
                <p
                  key={i}
                  className={styles.statement}
                  style={{
                    opacity: motion.opacity * exitOp,
                    top: `${motion.top}cqh`,
                    fontSize: `${(motion.font / 1728) * 100}cqw`,
                    pointerEvents: 'none',
                  }}
                  aria-hidden={motion.opacity * exitOp < 0.05}
                  data-phase={motion.phase}
                >
                  {copy}
                </p>
              )
            })}
          </>
        )
      }}
    </PinnedStage>
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
