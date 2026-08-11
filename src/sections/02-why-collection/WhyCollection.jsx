import GradientStage from '../../components/GradientStage'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { easeInOutQuint, easeOutCubic, lerp } from '../../lib/motion'
import { SCENE_INDEX } from '../../nav/scenes'
import { useSceneBlend } from '../../nav/useNavigator'
import styles from './WhyCollection.module.css'

/**
 * Narrative copy — Scene 2 shows indices 0–2 together; Scene 3 is index 3.
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
 * Shared transform origin = Scene 1 active slot (1728×1117).
 * Motion uses transform + opacity only (not layout top / font-size).
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

/** Scene 1 — unchanged (`02 Why Collections 1.svg`). */
const SCENE1 = {
  top: GEO.activeTop,
  font: GEO.activeFont,
  widthCqw: 56,
}

/**
 * Scene 2 — three lines together (`02 Why Collections 2.svg`, path min-y / width).
 */
const SCENE2_LINES = [
  {
    top: (451.9 / 1117) * 100,
    font: 24,
    widthCqw: ((740.3 - 88.0) / 1728) * 100,
  },
  {
    top: (562.9 / 1117) * 100,
    font: 24,
    widthCqw: ((963.2 - 81.7) / 1728) * 100,
  },
  {
    top: (673.9 / 1117) * 100,
    font: 24,
    widthCqw: ((994.7 - 87.0) / 1728) * 100,
  },
]

/** Scene 3 — single block (`02 Why Collections 3.svg`). */
const SCENE3 = {
  top: (547.4 / 1117) * 100,
  font: 24,
  widthCqw: ((714.1 - 81.2) / 1728) * 100,
}

const WHY_TITLE = SCENE_INDEX['why-title']
const WHY_1 = SCENE_INDEX['why-1']
const WHY_2 = SCENE_INDEX['why-2']
const WHY_3 = SCENE_INDEX['why-3']
const CE_1 = SCENE_INDEX['ce-1']

function pose(topCqh, fontPx, opacity) {
  return {
    y: topCqh - GEO.activeTop,
    scale: fontPx / GEO.activeFont,
    opacity,
  }
}

function restPose(rest) {
  return pose(rest.top, rest.font, GEO.activeOpacity)
}

function enterPoseFor(rest) {
  return pose(rest.top + 8, rest.font * 0.72, GEO.enterOpacity)
}

function scene1Active() {
  return restPose(SCENE1)
}

function scene1Enter() {
  return pose(GEO.enterTop, GEO.enterFont, GEO.enterOpacity)
}

function scene2LineActive(index) {
  return restPose(SCENE2_LINES[index])
}

function scene3Active() {
  return restPose(SCENE3)
}

function mixPose(a, b, t) {
  return {
    y: lerp(a.y, b.y, t),
    scale: lerp(a.scale, b.scale, t),
    opacity: lerp(a.opacity, b.opacity, t),
  }
}

function computeExitPose(activePose, rawT, reduced) {
  const exitT = reduced ? rawT : easeInOutQuint(rawT)
  const previous = pose(GEO.previousTop, GEO.previousFont, GEO.previousOpacity)
  const dismiss = pose(GEO.dismissTop, GEO.dismissFont, GEO.dismissOpacity)
  return exitT < 0.65
    ? mixPose(activePose, previous, exitT / 0.65)
    : mixPose(previous, dismiss, (exitT - 0.65) / 0.35)
}

function computeEnterPose(activePose, rest, rawT, reduced) {
  const enterT = reduced ? rawT : easeOutCubic(rawT)
  return mixPose(enterPoseFor(rest), activePose, enterT)
}

/** -1 = title only; 0..2 = Why scenes 1..3. */
function whySceneIndex(sceneIndex) {
  if (sceneIndex <= WHY_TITLE) return -1
  if (sceneIndex === WHY_1) return 0
  if (sceneIndex === WHY_2) return 1
  if (sceneIndex === WHY_3) return 2
  if (sceneIndex >= CE_1) return 2
  return -1
}

function settledLayers(scene) {
  if (scene === 0) {
    return [
      {
        index: 0,
        pose: scene1Active(),
        widthCqw: SCENE1.widthCqw,
        role: 'current',
      },
    ]
  }
  if (scene === 1) {
    return SCENE2_LINES.map((line, index) => ({
      index,
      pose: scene2LineActive(index),
      widthCqw: line.widthCqw,
      role: 'current',
    }))
  }
  if (scene === 2) {
    return [
      {
        index: 3,
        pose: scene3Active(),
        widthCqw: SCENE3.widthCqw,
        role: 'current',
      },
    ]
  }
  return []
}

function relayLayers(blend, reduced) {
  const fromScene = whySceneIndex(blend.from)
  const toScene = whySceneIndex(
    blend.settled ? blend.sceneIndex : blend.to,
  )
  const rawT = blend.settled ? 1 : blend.t

  if (blend.settled) {
    const current = whySceneIndex(blend.sceneIndex)
    if (current < 0) return { headingT: 0, layers: [] }
    return { headingT: 1, layers: settledLayers(current) }
  }

  const t = reduced ? rawT : easeInOutQuint(rawT)

  // Title ↔ Scene 1 (unchanged).
  if (fromScene < 0 && toScene === 0) {
    const enterT = reduced ? rawT : easeOutCubic(rawT)
    return {
      headingT: t,
      layers: [
        {
          index: 0,
          pose: mixPose(scene1Enter(), scene1Active(), enterT),
          widthCqw: SCENE1.widthCqw,
          role: 'incoming',
        },
      ],
    }
  }
  if (fromScene === 0 && toScene < 0) {
    const exitT = reduced ? rawT : easeInOutQuint(rawT)
    return {
      headingT: 1 - t,
      layers: [
        {
          index: 0,
          pose: mixPose(scene1Active(), scene1Enter(), exitT),
          widthCqw: SCENE1.widthCqw,
          role: 'exiting',
        },
      ],
    }
  }

  // Scene 1 ↔ Scene 2 — three-line composition settles together.
  if (fromScene === 0 && toScene === 1) {
    const enterT = reduced ? rawT : easeOutCubic(rawT)
    return {
      headingT: 1,
      layers: [
        {
          index: 0,
          pose: mixPose(scene1Active(), scene2LineActive(0), enterT),
          widthCqw: SCENE2_LINES[0].widthCqw,
          role: 'morph',
        },
        {
          index: 1,
          pose: computeEnterPose(
            scene2LineActive(1),
            SCENE2_LINES[1],
            rawT,
            reduced,
          ),
          widthCqw: SCENE2_LINES[1].widthCqw,
          role: 'incoming',
        },
        {
          index: 2,
          pose: computeEnterPose(
            scene2LineActive(2),
            SCENE2_LINES[2],
            rawT,
            reduced,
          ),
          widthCqw: SCENE2_LINES[2].widthCqw,
          role: 'incoming',
        },
      ],
    }
  }
  if (fromScene === 1 && toScene === 0) {
    const morphT = reduced ? rawT : easeOutCubic(rawT)
    return {
      headingT: 1,
      layers: [
        {
          index: 0,
          pose: mixPose(scene2LineActive(0), scene1Active(), morphT),
          widthCqw: SCENE1.widthCqw,
          role: 'morph',
        },
        {
          index: 1,
          pose: computeExitPose(scene2LineActive(1), rawT, reduced),
          widthCqw: SCENE2_LINES[1].widthCqw,
          role: 'exiting',
        },
        {
          index: 2,
          pose: computeExitPose(scene2LineActive(2), rawT, reduced),
          widthCqw: SCENE2_LINES[2].widthCqw,
          role: 'exiting',
        },
      ],
    }
  }

  // Scene 2 ↔ Scene 3 — same relay language.
  if (fromScene === 1 && toScene === 2) {
    return {
      headingT: 1,
      layers: [
        ...SCENE2_LINES.map((line, index) => ({
          index,
          pose: computeExitPose(scene2LineActive(index), rawT, reduced),
          widthCqw: line.widthCqw,
          role: 'exiting',
        })),
        {
          index: 3,
          pose: computeEnterPose(scene3Active(), SCENE3, rawT, reduced),
          widthCqw: SCENE3.widthCqw,
          role: 'incoming',
        },
      ],
    }
  }
  if (fromScene === 2 && toScene === 1) {
    return {
      headingT: 1,
      layers: [
        ...SCENE2_LINES.map((line, index) => ({
          index,
          pose: computeEnterPose(
            scene2LineActive(index),
            line,
            rawT,
            reduced,
          ),
          widthCqw: line.widthCqw,
          role: 'incoming',
        })),
        {
          index: 3,
          pose: computeExitPose(scene3Active(), rawT, reduced),
          widthCqw: SCENE3.widthCqw,
          role: 'exiting',
        },
      ],
    }
  }

  // why-3 ↔ ce: Scene 3 frozen (content opacity owns leave / enter).
  if (
    (blend.from === WHY_3 && blend.to === CE_1) ||
    (blend.from === CE_1 && blend.to === WHY_3)
  ) {
    return {
      headingT: 1,
      layers: [
        {
          index: 3,
          pose: scene3Active(),
          widthCqw: SCENE3.widthCqw,
          role: 'current',
        },
      ],
    }
  }

  return { headingT: fromScene < 0 && toScene < 0 ? 0 : 1, layers: [] }
}

function contentOpacity(blend) {
  if (blend.settled) {
    return blend.sceneIndex >= CE_1 ? 0 : blend.sceneIndex >= WHY_TITLE ? 1 : 0
  }
  if (blend.from === WHY_3 && blend.to === CE_1) {
    return 1 - easeInOutQuint(Math.min(1, Math.max(0, blend.t / 0.22)))
  }
  if (blend.from === CE_1 && blend.to === WHY_3) {
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
    ((blend.from >= WHY_TITLE && blend.from <= WHY_3) ||
      (blend.to >= WHY_TITLE && blend.to <= WHY_3) ||
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
      <h2
        className={styles.heading}
        style={{
          '--heading-t': headingT,
        }}
      >
        Why Collection?
      </h2>

      {layers.map(({ index, pose: p, role, widthCqw }) => (
        <p
          key={index}
          className={styles.statement}
          data-role={role}
          style={{
            width: `${widthCqw}cqw`,
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
      <p className={styles.stackedStatement}>{STATEMENTS[0]}</p>
      <div className={styles.stackedScene2}>
        {STATEMENTS.slice(0, 3).map((copy, i) => (
          <p key={i} className={styles.stackedStatement}>
            {copy}
          </p>
        ))}
      </div>
      <p className={styles.stackedStatement}>{STATEMENTS[3]}</p>
    </div>
  )
}

export default WhyCollection
