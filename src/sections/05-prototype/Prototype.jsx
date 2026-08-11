import GradientStage from '../../components/GradientStage'
import PinnedStage from '../../components/PinnedStage'
import Stage from '../../components/Stage'
import { PROTOTYPE_URL } from '../../config/links'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { img } from '../../lib/assets'
import {
  clamp,
  easeInOutQuint,
  lerp,
  rangeProgress,
} from '../../lib/motion'
import { exit05to06T } from '../../nav/exit05to06'
import { SCENE_INDEX } from '../../nav/scenes'
import { useSceneBlend } from '../../nav/useNavigator'
import styles from './Prototype.module.css'

/**
 * §05 Prototype — push entrance from sol-3; layered exit to behind-1.
 * Mockup is the sole clickable target (PROTOTYPE_URL).
 * "Tap here to start" lives in the mockup artwork as instructional text only.
 */

const SOL_3 = SCENE_INDEX['sol-3']
const PROTO = SCENE_INDEX['proto']
const BEHIND_1 = SCENE_INDEX['behind-1']
const BEHIND_2 = SCENE_INDEX['behind-2']

/** 0→1 presence for §04→05 push (sol-3 ↔ proto). */
function pushPresence(blend) {
  if (blend.settled) {
    if (blend.sceneIndex === PROTO) return 1
    // Past Prototype: treat push as complete so exit motion owns leave.
    if (blend.sceneIndex >= BEHIND_1) return 1
    return 0
  }
  if (blend.from === SOL_3 && blend.to === PROTO) return blend.t
  if (blend.from === PROTO && blend.to === SOL_3) return 1 - blend.t
  if (
    blend.to === PROTO ||
    blend.from === PROTO ||
    blend.to >= BEHIND_1 ||
    blend.from >= BEHIND_1
  ) {
    return 1
  }
  return 0
}

/**
 * Physical push + copy fade (one timeline, reverse via 1−t):
 *  Phase A  0.00–1.00  panel translateX −100% → 0 (locked with §04 push-out)
 *  Phase B  0.48–0.78  Prototype copy fades in after push is well underway
 */
function enterFromSol(presence, reduced) {
  const pushEased = reduced ? presence : easeInOutQuint(presence)
  const textT = easeInOutQuint(rangeProgress(presence, 0.48, 0.78))
  return {
    panelX: lerp(-100, 0, pushEased),
    textOpacity: textT,
  }
}

/**
 * §05→06 layered exit (exitT 0→1, reverse via 1−t):
 *  Phase A  0.00–0.35  Prototype card exits LEFT
 *  Phase B  0.22–0.50  §05 copy slowly fades (after card is clearly leaving)
 *  Phase C  (SharedStageBackground) gradient opacity fade
 *  Phase D  (BehindTheWork) collage reveal
 */
function exitToBehind(exitT, reduced) {
  const cardT = reduced
    ? rangeProgress(exitT, 0, 0.35)
    : easeInOutQuint(rangeProgress(exitT, 0, 0.35))
  const textT = easeInOutQuint(rangeProgress(exitT, 0.22, 0.5))
  return {
    panelX: lerp(0, -110, cardT),
    textOpacity: 1 - textT,
  }
}

function Prototype({ phase1Static = false } = {}) {
  const isMobile = useMediaQuery('(max-width: 767px)')
  const reduced = useReducedMotion()

  if (isMobile) {
    return <MobilePinnedPrototype reduced={reduced} />
  }

  if (phase1Static) {
    return (
      <Stage className={styles.section} aria-label="Prototype">
        <PrototypeChrome
          panelX={0}
          textOpacity={1}
          reduced={reduced}
          interactive
        />
      </Stage>
    )
  }

  return <CinematicPrototype reduced={reduced} />
}

function CinematicPrototype({ reduced }) {
  const blend = useSceneBlend()
  const push = pushPresence(blend)
  const exitT = exit05to06T(blend)
  const behindInternal =
    !blend.settled &&
    blend.from >= BEHIND_1 &&
    blend.from <= BEHIND_2 &&
    blend.to >= BEHIND_1 &&
    blend.to <= BEHIND_2
  const involved =
    (push > 0.001 && exitT < 0.999) ||
    (exitT > 0.001 && !behindInternal) ||
    (!blend.settled &&
      (blend.to === PROTO ||
        blend.from === PROTO ||
        // §05↔§06 handoff only (not behind internals)
        (blend.to === BEHIND_1 && blend.from === PROTO) ||
        (blend.from === BEHIND_1 && blend.to === PROTO)))

  // Stay unmounted on behind-1/2 (settled or internal veil); remount for reverse to proto.
  if (
    !involved ||
    (exitT >= 0.999 && (blend.settled || behindInternal))
  ) {
    return null
  }

  const motion =
    exitT > 0.001
      ? exitToBehind(exitT, reduced)
      : enterFromSol(push, reduced)

  const interactive =
    exitT < 0.001 && push > 0.92 && blend.settled && blend.sceneIndex === PROTO

  return (
    <section
      className={styles.phaseLayer}
      aria-label="Prototype"
      style={{
        pointerEvents: push > 0.55 && exitT < 0.5 ? 'auto' : 'none',
      }}
      aria-hidden={push < 0.05 || exitT > 0.95}
    >
      {/* Gradient: SharedStageBackground — Phase C opacity only. */}

      <div
        className={styles.panel}
        style={{ transform: `translate3d(${motion.panelX}%, 0, 0)` }}
      >
        <div className={styles.mockup}>
          {interactive ? (
            <a
              className={`${styles.link} ${reduced ? styles.linkReduced : ''}`}
              href={PROTOTYPE_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open the interactive Figma prototype in a new tab"
            >
              <img
                className={styles.phone}
                src={img('05 Prototype asset/05 Prototype pic.png')}
                alt=""
              />
            </a>
          ) : (
            <div className={styles.linkIdle} aria-hidden="true">
              <img
                className={styles.phone}
                src={img('05 Prototype asset/05 Prototype pic.png')}
                alt=""
              />
            </div>
          )}
        </div>
      </div>

      <p className={styles.eyebrow} style={{ opacity: motion.textOpacity }}>
        Prototype
      </p>
      {/* Broken after the comma because that is where the reference breaks it. */}
      <h2 className={styles.heading} style={{ opacity: motion.textOpacity }}>
        Click the Mockup,
        <br />
        try it by yourself!
      </h2>
    </section>
  )
}

function PrototypeChrome({ panelX, textOpacity, reduced, interactive }) {
  return (
    <>
      <div className={styles.gradientSlot}>
        <GradientStage />
      </div>

      <div
        className={styles.panel}
        style={{ transform: `translate3d(${panelX}%, 0, 0)` }}
      >
        <div className={styles.mockup}>
          {interactive ? (
            <a
              className={`${styles.link} ${reduced ? styles.linkReduced : ''}`}
              href={PROTOTYPE_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open the interactive Figma prototype in a new tab"
            >
              <img
                className={styles.phone}
                src={img('05 Prototype asset/05 Prototype pic.png')}
                alt=""
              />
            </a>
          ) : (
            <div className={styles.linkIdle} aria-hidden="true">
              <img
                className={styles.phone}
                src={img('05 Prototype asset/05 Prototype pic.png')}
                alt=""
              />
            </div>
          )}
        </div>
      </div>

      <p className={styles.eyebrow} style={{ opacity: textOpacity }}>
        Prototype
      </p>
      <h2 className={styles.heading} style={{ opacity: textOpacity }}>
        Click the Mockup,
        <br />
        try it by yourself!
      </h2>
    </>
  )
}

/** Mobile keeps the legacy pinned stage (no page-level navigator). */
function MobilePinnedPrototype({ reduced }) {
  return (
    <PinnedStage
      className={styles.section}
      ariaLabel="Prototype"
      height="calc(160vh + 180vh)"
      overlapVh={160}
      startOffsetVh={0}
    >
      {({ progress, isPinned }) => {
        const p = isPinned ? clamp(progress, 0, 1) : 1
        const t = easeInOutQuint(rangeProgress(p, 0, 0.45))
        const panelX = lerp(-100, 0, t)
        const textOpacity = p >= 0.44 ? 1 : 0
        return (
          <PrototypeChrome
            panelX={panelX}
            textOpacity={textOpacity}
            reduced={reduced}
            interactive={p >= 0.44}
          />
        )
      }}
    </PinnedStage>
  )
}

export default Prototype
