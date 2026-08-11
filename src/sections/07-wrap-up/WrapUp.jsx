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
  lerp,
  rangeProgress,
} from '../../lib/motion'
import { exit06to07T } from '../../nav/exit06to07'
import { SCENE_INDEX } from '../../nav/scenes'
import { useSceneBlend } from '../../nav/useNavigator'
import styles from './WrapUp.module.css'

/**
 * §07 Wrap Up — entrance to Scene 1, then Scene 1→2 statement rise.
 * Scene 3 / Tools / Quick Links / footer remain deferred.
 *
 * Geometry from references (1728×1117 → cqh), measured from PNG text bands:
 *  Scene 1 statement top ≈ 43.903cqh
 *  Scene 2 statement top ≈ 20.850cqh
 *  Scene 2 “If I had more time…” top ≈ 61.853cqh
 */

const WRAP_1 = SCENE_INDEX['wrap-1']
const WRAP_2 = SCENE_INDEX['wrap-2']
const BEHIND_2 = SCENE_INDEX['behind-2']

/** Tops in cqh from approved Wrapup 1 / Wrapup 2 geometry. */
const S1_STATEMENT_TOP = 43.903
const S2_STATEMENT_TOP = 20.85
const S2_FUTURE_TOP = 61.853
/** Rise delta — animated via transform, not per-frame `top`. */
const STATEMENT_RISE_CQH = S2_STATEMENT_TOP - S1_STATEMENT_TOP

const STATEMENT = (
  <>
    This redesign does not add an entirely new system.
    <br />
    It <strong>strengthens the existing Collection experience</strong> by
    <br />
    making saving consistent and collaboration flexible over time.
  </>
)

const FUTURE_BODY =
  'I would validate the redesigned flow with users and explore shared notes, smarter collection organization and clearer collaboration permissions.'

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

/**
 * wrap-1 → wrap-2 playhead 0→1 (reverse via 1−t).
 */
function scene2CoverT(blend) {
  if (blend.settled) {
    return blend.sceneIndex >= WRAP_2 ? 1 : 0
  }
  if (blend.from === WRAP_1 && blend.to === WRAP_2) return blend.t
  if (blend.from === WRAP_2 && blend.to === WRAP_1) return 1 - blend.t
  if (blend.to >= WRAP_2 || blend.from >= WRAP_2) return 1
  return 0
}

/**
 * Scene 1→2 (cover 0→1, reverse via 1−t):
 *  Phase A  0.00–0.62  statement rises to Wrapup-2 top (transform only) and STOPS
 *  Phase B  0.55–0.92  “If I had more time…” fades in after rise is substantial
 */
function scene2Motion(cover, reduced) {
  const riseT = reduced
    ? rangeProgress(cover, 0, 0.62)
    : easeInOutQuint(rangeProgress(cover, 0, 0.62))
  const futureT = reduced
    ? rangeProgress(cover, 0.55, 0.92)
    : easeInOutQuint(rangeProgress(cover, 0.55, 0.92))
  return {
    statementY: lerp(0, STATEMENT_RISE_CQH, riseT),
    futureOpacity: futureT,
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
        <WrapChrome
          bgOpacity={1}
          textOpacity={1}
          statementY={0}
          futureOpacity={0}
        />
      </Stage>
    )
  }

  return <CinematicWrap reduced={reduced} />
}

function WrapChrome({
  bgOpacity,
  textOpacity,
  statementY,
  futureOpacity,
}) {
  return (
    <>
      <div className={styles.bgSlot} style={{ opacity: bgOpacity }}>
        <GradientStage />
      </div>

      <div style={{ opacity: textOpacity }} aria-hidden={textOpacity < 0.05}>
        <h2 className={styles.eyebrow}>Wrap up</h2>

        <p
          className={styles.paragraph}
          style={{
            top: `${S1_STATEMENT_TOP}cqh`,
            transform: `translate3d(0, ${statementY}cqh, 0)`,
          }}
        >
          {STATEMENT}
        </p>

        <div
          className={styles.future}
          style={{
            top: `${S2_FUTURE_TOP}cqh`,
            opacity: futureOpacity,
          }}
          aria-hidden={futureOpacity < 0.05}
        >
          <p className={styles.futureHeading}>If I had more time...</p>
          <p className={styles.futureBody}>{FUTURE_BODY}</p>
        </div>
      </div>
    </>
  )
}

function CinematicWrap({ reduced }) {
  const blend = useSceneBlend()
  const presence = exit06to07T(blend)
  const cover = scene2CoverT(blend)
  const involved =
    presence > 0.001 ||
    cover > 0.001 ||
    (blend.settled &&
      blend.sceneIndex >= WRAP_1 &&
      blend.sceneIndex <= WRAP_2) ||
    (!blend.settled &&
      ((blend.from === BEHIND_2 && blend.to === WRAP_1) ||
        (blend.from === WRAP_1 && blend.to === BEHIND_2) ||
        (blend.from >= WRAP_1 &&
          blend.from <= WRAP_2 &&
          blend.to >= WRAP_1 &&
          blend.to <= WRAP_2)))

  if (!involved) {
    return null
  }

  const enter = enterMotion(presence, reduced)
  const scene2 = scene2Motion(cover, reduced)

  return (
    <section
      className={styles.phaseLayer}
      aria-label="Wrap up"
      style={{
        pointerEvents: presence > 0.85 ? 'auto' : 'none',
      }}
      aria-hidden={presence < 0.05}
    >
      {/* Background stationary. Scene 3 / lists / footer not mounted. */}
      <WrapChrome
        bgOpacity={enter.bgOpacity}
        textOpacity={enter.textOpacity}
        statementY={scene2.statementY}
        futureOpacity={scene2.futureOpacity}
      />
    </section>
  )
}

/** Mobile keeps a simplified pinned stage. */
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
        const cover = rangeProgress(p, 0, 0.45)
        const scene2 = scene2Motion(cover, reduced)
        return (
          <WrapChrome
            bgOpacity={1}
            textOpacity={1}
            statementY={scene2.statementY}
            futureOpacity={scene2.futureOpacity}
          />
        )
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
        <p className={styles.futureBody}>{FUTURE_BODY}</p>
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
