import GradientStage from '../../components/GradientStage'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { easeInOutQuint, easeOutCubic, lerp } from '../../lib/motion'
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
 * Shared transform origin = Why 1 / Why 4 active slot (1728×1117).
 * Motion uses transform from this slot (not layout `top`/`font-size`).
 *
 * Why 2 / Why 3 resting overrides from latest
 * `references/svg/02 Why Collections {2,3}.svg` (path bbox tops / widths).
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
  widthCqw: 56,
}

/** Per-statement active resting geometry (indices 1 / 2 updated). */
const STATEMENT_REST = [
  { top: GEO.activeTop, font: GEO.activeFont, widthCqw: GEO.widthCqw },
  // Why Collections 2 — middle statement line (path y≈562.9, fs-24)
  {
    top: (562.9 / 1117) * 100,
    font: 24,
    widthCqw: ((963.2 - 81.7) / 1728) * 100,
  },
  // Why Collections 3 — statement block (path y≈547.4, fs-24)
  {
    top: (547.4 / 1117) * 100,
    font: 24,
    widthCqw: ((714.1 - 81.2) / 1728) * 100,
  },
  { top: GEO.activeTop, font: GEO.activeFont, widthCqw: GEO.widthCqw },
]

const WHY_TITLE = SCENE_INDEX['why-title']
const WHY_1 = SCENE_INDEX['why-1']
const WHY_4 = SCENE_INDEX['why-4']
const CE_1 = SCENE_INDEX['ce-1']

/** Pose relative to the shared active resting slot (transform + opacity only). */
function pose(topCqh, fontPx, opacity) {
  return {
    y: topCqh - GEO.activeTop,
    scale: fontPx / GEO.activeFont,
    opacity,
  }
}

/** Active / enter poses for a statement index; previous/dismiss stay shared. */
function posesFor(index) {
  const rest = STATEMENT_REST[index] ?? STATEMENT_REST[0]
  return {
    active: pose(rest.top, rest.font, GEO.activeOpacity),
    previous: pose(GEO.previousTop, GEO.previousFont, GEO.previousOpacity),
    enter: pose(rest.top + 8, rest.font * 0.72, GEO.enterOpacity),
    dismiss: pose(GEO.dismissTop, GEO.dismissFont, GEO.dismissOpacity),
  }
}

function mixPose(a, b, t) {
  return {
    y: lerp(a.y, b.y, t),
    scale: lerp(a.scale, b.scale, t),
    opacity: lerp(a.opacity, b.opacity, t),
  }
}

/** -1 = title only; 0..3 = active statement index. */
function statementIndexForScene(sceneIndex) {
  if (sceneIndex <= WHY_TITLE) return -1
  if (sceneIndex >= WHY_1 && sceneIndex <= WHY_4) return sceneIndex - WHY_1
  if (sceneIndex >= CE_1) return 3
  return -1
}

/**
 * Relay layers for the current navigator blend.
 * At most two statement indices are ever returned — never a historical stack.
 */
function relayLayers(blend, reduced) {
  const fromIdx = statementIndexForScene(blend.from)
  const toIdx = statementIndexForScene(blend.settled ? blend.sceneIndex : blend.to)
  const rawT = blend.settled ? 1 : blend.t

  // Settled: only the current statement at full focus (no lingering previous).
  if (blend.settled) {
    const current = statementIndexForScene(blend.sceneIndex)
    if (current < 0) return { headingT: 0, layers: [] }
    return {
      headingT: 1,
      layers: [
        { index: current, pose: posesFor(current).active, role: 'current' },
      ],
    }
  }

  const t = reduced ? rawT : easeInOutQuint(rawT)

  // Title ↔ first statement (heading demotes while stmt 0 enters / exits).
  if (fromIdx < 0 && toIdx === 0) {
    const enterT = reduced ? rawT : easeOutCubic(rawT)
    const p0 = posesFor(0)
    return {
      headingT: t,
      layers: [
        {
          index: 0,
          pose: mixPose(p0.enter, p0.active, enterT),
          role: 'incoming',
        },
      ],
    }
  }
  if (fromIdx === 0 && toIdx < 0) {
    const exitT = reduced ? rawT : easeInOutQuint(rawT)
    const p0 = posesFor(0)
    return {
      headingT: 1 - t,
      layers: [
        {
          index: 0,
          pose: mixPose(p0.active, p0.enter, exitT),
          role: 'exiting',
        },
      ],
    }
  }

  // Statement ↔ statement relay (only the pair in this gesture).
  if (fromIdx >= 0 && toIdx >= 0 && fromIdx !== toIdx) {
    const exitT = reduced ? rawT : easeInOutQuint(rawT)
    const enterT = reduced ? rawT : easeOutCubic(rawT)
    const fromPoses = posesFor(fromIdx)
    const toPoses = posesFor(toIdx)

    // Exit: active → previous pose → fully dismissed (no leftover ghost).
    const exitPose =
      exitT < 0.65
        ? mixPose(fromPoses.active, fromPoses.previous, exitT / 0.65)
        : mixPose(fromPoses.previous, fromPoses.dismiss, (exitT - 0.65) / 0.35)

    const enterPose = mixPose(toPoses.enter, toPoses.active, enterT)

    return {
      headingT: 1,
      layers: [
        {
          index: fromIdx,
          pose: exitPose,
          role: 'exiting',
        },
        {
          index: toIdx,
          pose: enterPose,
          role: 'incoming',
        },
      ],
    }
  }

  // why-4 ↔ ce only: keep statement 3 frozen (content opacity owns leave/enter).
  // Must NOT use `toIdx === 3` alone — that index is also the why-3→why-4
  // destination and is already handled by the stmt-relay branch above.
  if (
    (blend.from === WHY_4 && blend.to === CE_1) ||
    (blend.from === CE_1 && blend.to === WHY_4)
  ) {
    return {
      headingT: 1,
      layers: [{ index: 3, pose: posesFor(3).active, role: 'current' }],
    }
  }

  return { headingT: fromIdx < 0 && toIdx < 0 ? 0 : 1, layers: [] }
}

/**
 * Content-only opacity (gradient lives on SharedStageBackground).
 * §02→03 Phase A: why content fades early; reverse fades why back in late.
 */
function contentOpacity(blend) {
  if (blend.settled) {
    return blend.sceneIndex >= CE_1 ? 0 : blend.sceneIndex >= WHY_TITLE ? 1 : 0
  }
  // Phase A forward: §02 active content slowly fades out.
  if (blend.from === WHY_4 && blend.to === CE_1) {
    return 1 - easeInOutQuint(Math.min(1, Math.max(0, blend.t / 0.22)))
  }
  // Phase A reverse: §02 content returns after CE has exited.
  if (blend.from === CE_1 && blend.to === WHY_4) {
    return easeInOutQuint(Math.min(1, Math.max(0, (blend.t - 0.78) / 0.22)))
  }
  if (blend.from < WHY_TITLE && blend.to === WHY_TITLE) {
    return easeInOutQuint(Math.min(1, Math.max(0, (blend.t - 0.35) / 0.65)))
  }
  if (blend.from === WHY_TITLE && blend.to < WHY_TITLE) {
    return 1 - easeInOutQuint(Math.min(1, Math.max(0, blend.t / 0.65)))
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

  const opacity = contentOpacity(blend)
  const whyInvolved =
    !blend.settled &&
    ((blend.from >= WHY_TITLE && blend.from <= WHY_4) ||
      (blend.to >= WHY_TITLE && blend.to <= WHY_4) ||
      blend.from === CE_1 ||
      blend.to === CE_1)
  const show = opacity > 0.001 || whyInvolved

  if (!show) return null

  const { headingT, layers } = relayLayers(blend, reduced)

  return (
    <section
      className={styles.layer}
      aria-label="Why Collection"
      style={{ opacity, pointerEvents: opacity < 0.05 ? 'none' : 'auto' }}
      aria-hidden={opacity < 0.05}
    >
      {/* Gradient: SharedStageBackground — content layers only here. */}

      <h2
        className={styles.heading}
        style={{
          '--heading-t': headingT,
        }}
      >
        Why Collection?
      </h2>

      {layers.map(({ index, pose: p, role }) => (
        <p
          key={index}
          className={styles.statement}
          data-role={role}
          style={{
            width: `${STATEMENT_REST[index]?.widthCqw ?? GEO.widthCqw}cqw`,
            opacity: p.opacity,
            transform: `translate3d(0, ${p.y}cqh, 0) scale(${p.scale})`,
          }}
          aria-hidden={p.opacity < 0.05}
        >
          {STATEMENTS[index]}
        </p>
      ))}
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
