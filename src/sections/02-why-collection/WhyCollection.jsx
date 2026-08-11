import GradientStage from '../../components/GradientStage'
import PinnedStage from '../../components/PinnedStage'
import { HERO_EXIT_VH, HERO_TRACK_VH } from '../../config/layout'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import {
  clamp,
  easeInCubic,
  easeOutCubic,
  lerp,
  rangeProgress,
} from '../../lib/motion'
import styles from './WhyCollection.module.css'

/**
 * Narrative copy for the cinematic typography stage — order matches the
 * `02 Why Collections 2/3/4/6` reference snapshots.
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
 * Geometry from `references/svg/02 Why Collections {2,3,4}.svg` on the 1728×1117
 * frame. Tops are `cqh` (= % of frame height). Font sizes map to the type scale:
 * active = 48, previous = 24 (path bounds 106.8 vs 53.4).
 */
const GEO = {
  /** Frame 3/4 previous-statement band (y ≈ 187.9). */
  previousTop: (187.9 / 1117) * 100,
  /** Frame 3/4 active-statement band (y ≈ 592.9). */
  activeTop: (592.9 / 1117) * 100,
  /** Enter from below the active band. */
  enterTop: (592.9 / 1117) * 100 + 10,
  /** Leave upward past the previous band when superseded. */
  dismissTop: (187.9 / 1117) * 100 - 4,
  activeFont: 48,
  previousFont: 24,
  enterFont: 48 * 0.7,
  dismissFont: 24 * 0.9,
  activeOpacity: 1,
  /** Dimmed-but-legible previous, matching refs 3/4. */
  previousOpacity: 0.38,
  enterOpacity: 0,
  dismissOpacity: 0,
}

/**
 * Progress windows. After a statement is read it settles into the previous slot
 * and stays visible for the entire hold of the next statement — it only dismisses
 * once a newer statement makes it no longer the immediate predecessor.
 *
 * | stmt | enter           | active hold     | → previous      | previous hold   | dismiss         |
 */
const WINDOWS = [
  { enter: [0.15, 0.2], activeEnd: 0.35, previousEnd: 0.55, dismissEnd: 0.6 },
  { enter: [0.35, 0.4], activeEnd: 0.55, previousEnd: 0.75, dismissEnd: 0.8 },
  { enter: [0.55, 0.6], activeEnd: 0.75, previousEnd: 1.0, dismissEnd: null },
  { enter: [0.75, 0.8], activeEnd: 1.0, previousEnd: null, dismissEnd: null },
]

const PIN_TRACK_VH = 420

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
  if (p <= 0.08) return { t: 0 }
  if (p >= 0.15) return { t: 1 }
  const raw = rangeProgress(p, 0.08, 0.15)
  return { t: reduced ? raw : easeInCubic(raw) }
}

/**
 * Continuous scroll-driven style for one statement. Previous statements settle
 * into the upper dimmed slot and remain there — they do not snap to opacity 0
 * when the next statement becomes active.
 */
function statementMotion(p, index, reduced) {
  const window = WINDOWS[index]
  const [enterStart, enterEnd] = window.enter
  const { activeEnd, previousEnd, dismissEnd } = window

  if (p < enterStart) {
    return { ...ENTER, phase: 'pending' }
  }

  // Entering: rise into the active slot.
  if (p < enterEnd) {
    const raw = rangeProgress(p, enterStart, enterEnd)
    const t = reduced ? raw : easeOutCubic(raw)
    if (reduced) return { ...ACTIVE, opacity: t, phase: 'entering' }
    return { ...mix(ENTER, ACTIVE, t), phase: 'entering' }
  }

  // Active hold.
  if (previousEnd == null || p <= activeEnd) {
    return { ...ACTIVE, phase: 'active' }
  }

  // Transition active → previous while the next statement enters.
  const next = WINDOWS[index + 1]
  const handoffEnd = next ? next.enter[1] : activeEnd
  if (p < handoffEnd) {
    const raw = rangeProgress(p, activeEnd, handoffEnd)
    const t = reduced ? raw : easeInCubic(raw)
    if (reduced) {
      return {
        ...PREVIOUS,
        opacity: lerp(ACTIVE.opacity, PREVIOUS.opacity, t),
        phase: 'to-previous',
      }
    }
    return { ...mix(ACTIVE, PREVIOUS, t), phase: 'to-previous' }
  }

  // Previous hold — stay visible above the active statement.
  if (dismissEnd == null || p <= previousEnd) {
    return { ...PREVIOUS, phase: 'previous' }
  }

  // Dismiss only once a newer statement supersedes this as predecessor.
  if (p >= dismissEnd) {
    return { ...DISMISS, phase: 'gone' }
  }

  const raw = rangeProgress(p, previousEnd, dismissEnd)
  const t = reduced ? raw : easeInCubic(raw)
  if (reduced) {
    return {
      ...DISMISS,
      opacity: lerp(PREVIOUS.opacity, DISMISS.opacity, t),
      phase: 'dismissing',
    }
  }
  return { ...mix(PREVIOUS, DISMISS, t), phase: 'dismissing' }
}

/** Which statement is "current" at `p` for the reduced-motion opacity crossfade. */
function currentStatementIndex(p) {
  if (p < 0.15) return -1
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
    >
      {({ progress, isPinned }) => {
        if (!isPinned) {
          return <StackedFallback />
        }

        const p = clamp(progress, 0, 1)
        const heading = headingMotion(p, reduced)
        const currentIdx = currentStatementIndex(p)

        return (
          <>
            <GradientStage className={styles.gradient} />

            <h2
              className={styles.heading}
              style={{ '--heading-t': heading.t }}
            >
              Why Collection?
            </h2>

            {STATEMENTS.map((copy, i) => {
              if (reduced) {
                // Opacity-only: show current + immediate predecessor (dimmed).
                const isCurrent = i === currentIdx
                const isPrevious = i === currentIdx - 1
                const opacity = isCurrent
                  ? 1
                  : isPrevious
                    ? GEO.previousOpacity
                    : 0
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
          </>
        )
      }}
    </PinnedStage>
  )
}

/** Mobile / unpinned: heading + all four statements in reading order, static. */
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
