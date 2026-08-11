import GradientStage from '../../components/GradientStage'
import PinnedStage from '../../components/PinnedStage'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import {
  clamp,
  easeInCubic,
  easeOutCubic,
  exitOpacity,
  lerp,
  rangeProgress,
} from '../../lib/motion'
import { HERO_EXIT_VH, HERO_TRACK_VH } from '../../config/layout'
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

/** Progress windows from ANIMATION_SPEC.md §02 (enterStart, enterEnd, holdEnd, exitEnd). */
const WINDOWS = [
  { enter: [0.15, 0.2], holdEnd: 0.35, exitEnd: 0.4 },
  { enter: [0.35, 0.4], holdEnd: 0.55, exitEnd: 0.6 },
  { enter: [0.55, 0.6], holdEnd: 0.75, exitEnd: 0.8 },
  { enter: [0.75, 0.8], holdEnd: 1.0, exitEnd: null },
]

/**
 * Track length after the Hero-exit dead zone. Long enough for the five content
 * holds in the default progress table without feeling rushed.
 */
const PIN_TRACK_VH = 420

function headingMotion(p, reduced) {
  if (p <= 0.08) return { t: 0 }
  if (p >= 0.15) return { t: 1 }
  const raw = rangeProgress(p, 0.08, 0.15)
  return { t: reduced ? raw : easeInCubic(raw) }
}

function statementMotion(p, window, reduced) {
  const [enterStart, enterEnd] = window.enter
  const { holdEnd, exitEnd } = window

  if (p < enterStart) {
    return { opacity: 0, y: 24, scale: 0.7, visible: false }
  }

  if (p < enterEnd) {
    const raw = rangeProgress(p, enterStart, enterEnd)
    const t = reduced ? raw : easeOutCubic(raw)
    return {
      opacity: t,
      y: reduced ? 0 : lerp(24, 0, t),
      scale: reduced ? 1 : lerp(0.7, 1, t),
      visible: true,
    }
  }

  if (exitEnd == null || p <= holdEnd) {
    return { opacity: 1, y: 0, scale: 1, visible: true }
  }

  if (p >= exitEnd) {
    return { opacity: 0, y: -24, scale: 0.85, visible: false }
  }

  const raw = rangeProgress(p, holdEnd, exitEnd)
  const t = reduced ? raw : easeInCubic(raw)
  return {
    opacity: reduced ? 1 - t : exitOpacity(t),
    y: reduced ? 0 : lerp(0, -24, t),
    scale: reduced ? 1 : lerp(1, 0.85, t),
    visible: true,
  }
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
                const isCurrent = i === currentIdx
                return (
                  <p
                    key={i}
                    className={styles.statement}
                    style={{
                      opacity: isCurrent ? 1 : 0,
                      transform: 'translateY(0) scale(1)',
                      pointerEvents: 'none',
                    }}
                    aria-hidden={!isCurrent}
                  >
                    {copy}
                  </p>
                )
              }

              const motion = statementMotion(p, WINDOWS[i], false)

              return (
                <p
                  key={i}
                  className={styles.statement}
                  style={{
                    opacity: motion.opacity,
                    transform: `translateY(${motion.y}px) scale(${motion.scale})`,
                    pointerEvents: 'none',
                  }}
                  aria-hidden={motion.opacity < 0.05}
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
