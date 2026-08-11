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
import { SCENE_INDEX } from '../../nav/scenes'
import { useSceneBlend } from '../../nav/useNavigator'
import styles from './Prototype.module.css'

/**
 * §05 Prototype — physical push entrance from sol-3 (shared timeline).
 * Mockup is the sole clickable target (PROTOTYPE_URL).
 * "Tap here to start" lives in the mockup artwork as instructional text only.
 * §05→06 is intentionally not implemented yet.
 */

const SOL_3 = SCENE_INDEX['sol-3']
const PROTO = SCENE_INDEX['proto']

/** Same 0→1 push playhead Solutions uses (sol-3 ↔ proto). */
function handoffPresence(blend) {
  if (blend.settled) {
    return blend.sceneIndex >= PROTO ? 1 : 0
  }
  if (blend.from === SOL_3 && blend.to === PROTO) return blend.t
  if (blend.from === PROTO && blend.to === SOL_3) return 1 - blend.t
  if (blend.to >= PROTO || blend.from >= PROTO) return 1
  return 0
}

/**
 * Physical push + copy fade (one timeline, reverse via 1−t):
 *  Phase A  0.00–1.00  panel translateX −100% → 0 (locked with §04 push-out)
 *  Phase B  0.48–0.78  Prototype copy fades in after push is well underway
 */
function motionFromPresence(presence, reduced) {
  const pushEased = reduced ? presence : easeInOutQuint(presence)
  const textT = easeInOutQuint(rangeProgress(presence, 0.48, 0.78))
  return {
    panelX: lerp(-100, 0, pushEased),
    textOpacity: textT,
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
  const presence = handoffPresence(blend)
  const involved =
    presence > 0.001 ||
    (!blend.settled && (blend.to === PROTO || blend.from === PROTO))

  if (!involved) {
    return null
  }

  const motion = motionFromPresence(presence, reduced)
  const interactive = presence > 0.92 && blend.settled

  return (
    <section
      className={styles.phaseLayer}
      aria-label="Prototype"
      style={{
        pointerEvents: presence > 0.55 ? 'auto' : 'none',
      }}
      aria-hidden={presence < 0.05}
    >
      {/* Gradient: SharedStageBackground — stays put; no local GradientStage. */}

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
