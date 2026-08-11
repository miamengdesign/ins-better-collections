import BackToTop from '../../components/BackToTop'
import GradientStage from '../../components/GradientStage'
import PinnedStage from '../../components/PinnedStage'
import Stage from '../../components/Stage'
import { GITHUB_URL, PROTOTYPE_URL, VERCEL_URL } from '../../config/links'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import {
  clamp,
  easeInOutQuint,
  rangeProgress,
} from '../../lib/motion'
import { exit06to07T } from '../../nav/exit06to07'
import { SCENE_INDEX } from '../../nav/scenes'
import { useSceneBlend } from '../../nav/useNavigator'
import styles from './WrapUp.module.css'

/**
 * §07 Wrap Up — cinematic entrance settles on Scene 1 only.
 * Scenes 2–3 remain for a later migration.
 *
 * Geometry from `07 Wrapup 1` SVG (1728×1117): statement top ≈43.903cqh.
 */

const WRAP_1 = SCENE_INDEX['wrap-1']
const BEHIND_2 = SCENE_INDEX['behind-2']

/** Tops in cqh from SVG path bboxes (Scene 1 resting). */
const S1_STATEMENT_TOP = 43.903

const STATEMENT = (
  <>
    This redesign does not add an entirely new system.
    <br />
    It <strong>strengthens the existing Collection experience</strong> by
    <br />
    making saving consistent and collaboration flexible over time.
  </>
)

const TOOLS = ['Figma', 'Claude Code', 'Cursor', 'ChatGPT Codex', 'Github', 'Vercel']

/**
 * §06→07 entrance on shared exit06to07T (reverse via 1−t):
 *  Phase A  (Behind) statement fades slowly
 *  Phase B  0.32–0.58  §07 gradient/composition fades in — text still hidden
 *  Phase C  0.58–0.70  short visual beat (bg only)
 *  Phase D  0.70–1.00  Scene 1 text fades in
 */
function enterMotion(presence, reduced) {
  const bgT = reduced
    ? rangeProgress(presence, 0.32, 0.58)
    : easeInOutQuint(rangeProgress(presence, 0.32, 0.58))
  const textT = reduced
    ? rangeProgress(presence, 0.7, 1)
    : easeInOutQuint(rangeProgress(presence, 0.7, 1))
  return {
    bgOpacity: bgT,
    textOpacity: textT,
  }
}

function WrapUp({ phase1Static = false } = {}) {
  const isMobile = useMediaQuery('(max-width: 767px)')
  const reduced = useReducedMotion()

  if (isMobile) {
    return <MobilePinnedWrap reduced={reduced} />
  }

  if (phase1Static) {
    return (
      <Stage className={styles.section} aria-label="Wrap up">
        <Scene1Chrome bgOpacity={1} textOpacity={1} />
      </Stage>
    )
  }

  return <CinematicWrap reduced={reduced} />
}

function Scene1Chrome({ bgOpacity, textOpacity }) {
  return (
    <>
      <div className={styles.bgSlot} style={{ opacity: bgOpacity }}>
        <GradientStage />
      </div>

      <div style={{ opacity: textOpacity }} aria-hidden={textOpacity < 0.05}>
        <h2 className={styles.eyebrow}>Wrap up</h2>
        <p
          className={styles.paragraph}
          style={{ top: `${S1_STATEMENT_TOP}cqh` }}
        >
          {STATEMENT}
        </p>
      </div>
    </>
  )
}

function CinematicWrap({ reduced }) {
  const blend = useSceneBlend()
  const presence = exit06to07T(blend)
  const involved =
    presence > 0.001 ||
    (blend.settled && blend.sceneIndex === WRAP_1) ||
    (!blend.settled &&
      ((blend.from === BEHIND_2 && blend.to === WRAP_1) ||
        (blend.from === WRAP_1 && blend.to === BEHIND_2)))

  if (!involved) {
    return null
  }

  const motion = enterMotion(presence, reduced)

  return (
    <section
      className={styles.phaseLayer}
      aria-label="Wrap up"
      style={{
        pointerEvents: presence > 0.85 ? 'auto' : 'none',
      }}
      aria-hidden={presence < 0.05}
    >
      {/* Scene 1 only — no future copy, tools, quick links, or footer yet. */}
      <Scene1Chrome
        bgOpacity={motion.bgOpacity}
        textOpacity={motion.textOpacity}
      />
    </section>
  )
}

/** Mobile keeps the legacy multi-scene pinned stage. */
function MobilePinnedWrap({ reduced }) {
  return (
    <PinnedStage
      className={styles.section}
      ariaLabel="Wrap up"
      height="calc(100vh + 220vh)"
      overlapVh={100}
      startOffsetVh={0}
      cinematic={{
        anchors: [0, 0.45, 1],
        durations: [1600, 1800],
        duration: 1600,
        reduced,
      }}
    >
      {({ progress, isPinned }) => {
        if (!isPinned) {
          return <MobileStack />
        }
        const p = clamp(progress, 0, 1)
        // Simplified mobile: show scene-1 composition for early progress.
        const textOn = p >= 0.02 ? 1 : 0
        return <Scene1Chrome bgOpacity={1} textOpacity={textOn} />
      }}
    </PinnedStage>
  )
}

function MobileStack() {
  return (
    <div className={styles.mobile}>
      <GradientStage className={styles.mobileBg} />
      <h2 className={styles.eyebrow}>Wrap up</h2>
      <p className={styles.paragraphStatic}>{STATEMENT}</p>
      <div className={styles.futureStatic}>
        <p className={styles.futureHeading}>If I had more time...</p>
        <p className={styles.futureBody}>
          I would validate the redesigned flow with users and explore shared notes,
          smarter collection organization and clearer collaboration permissions.
        </p>
      </div>
      <div className={styles.listsStatic}>
        <div>
          <p className={styles.listTitle}>Tools:</p>
          <ul className={styles.list}>
            {TOOLS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className={styles.listTitle}>Quick Link:</p>
          <ul className={`${styles.list} ${styles.quickLink}`}>
            <li>
              <a href={PROTOTYPE_URL} target="_blank" rel="noopener noreferrer">
                Figma Prototype
              </a>
            </li>
            <li>
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                Github
              </a>
            </li>
            <li>
              <a href={VERCEL_URL} target="_blank" rel="noopener noreferrer">
                Vercel
              </a>
            </li>
          </ul>
        </div>
      </div>
      <footer className={styles.footerStatic}>
        <span>Mia Meng, Product Designer</span>
        <BackToTop />
        <span className={styles.copyright}>©2026, All Rights Reserved</span>
      </footer>
    </div>
  )
}

export default WrapUp
