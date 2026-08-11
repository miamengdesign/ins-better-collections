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
 * §07 Wrap Up — Scene 1 entrance → Scene 2 rise → Scene 3 final composition.
 *
 * Wrap 1/2 geometry re-measured from `references/svg/07 Wrapup {1,2}.svg`
 * (1728×1117 → cqh/cqw), pixel-verified against rendered SVG:
 *  Scene 1 statement top = 530px → 47.4485cqh; width = 589px → 34.0856cqw
 *  Scene 2 statement top = 444px → 39.7493cqh (rise Δ ≈ 7.6992cqh)
 *  Scene 2 future block top = 616px → 55.1477cqh; width = 713px → 41.2616cqw
 *  Scene 2 heading→body gap = 16px → 1.4324cqh
 *  Statement / body fs-24 / fs-16; line-height = 1.1375em (3×24×1.1375 ≈ 82px block)
 *  Scene 3 untouched — Tools / Links / footer positions unchanged
 */

const WRAP_1 = SCENE_INDEX['wrap-1']
const WRAP_2 = SCENE_INDEX['wrap-2']
const WRAP_3 = SCENE_INDEX['wrap-3']
const BEHIND_2 = SCENE_INDEX['behind-2']

const S1_STATEMENT_TOP = (530 / 1117) * 100
const S2_STATEMENT_TOP = (444 / 1117) * 100
const S2_FUTURE_TOP = (616 / 1117) * 100
const S3_LISTS_TOP = 42.426
const S3_FOOTER_TOP = 90.886
/** Scene 1→2 rise delta — transform only. */
const STATEMENT_RISE_CQH = S2_STATEMENT_TOP - S1_STATEMENT_TOP
/**
 * Shared upward travel for Wrap-2 exit (preserves statement↔future spacing).
 * Enough to clear the main stage before Scene 3 dominates.
 */
const SCENE3_EXIT_Y_CQH = -48

const STATEMENT = (
  <>
    This redesign does not add an entirely new system.
    <br />
    It <strong>strengthens the existing Collection experience</strong> by
    <br />
    making saving consistent and collaboration flexible over time.
  </>
)

const FUTURE_BODY = (
  <>
    I would validate the redesigned flow with users and explore{' '}
    <strong>shared notes,</strong>
    <br />
    <strong>smarter collection organization</strong> and{' '}
    <strong>clearer collaboration permissions.</strong>
  </>
)

const TOOLS = ['Figma', 'Claude Code', 'Cursor', 'ChatGPT Codex', 'Github', 'Vercel']

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

function scene2CoverT(blend) {
  if (blend.settled) {
    return blend.sceneIndex >= WRAP_2 ? 1 : 0
  }
  if (blend.from === WRAP_1 && blend.to === WRAP_2) return blend.t
  if (blend.from === WRAP_2 && blend.to === WRAP_1) return 1 - blend.t
  if (blend.to >= WRAP_2 || blend.from >= WRAP_2) return 1
  return 0
}

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

/** wrap-2 → wrap-3 playhead 0→1 (reverse via 1−t). */
function scene3CoverT(blend) {
  if (blend.settled) {
    return blend.sceneIndex >= WRAP_3 ? 1 : 0
  }
  if (blend.from === WRAP_2 && blend.to === WRAP_3) return blend.t
  if (blend.from === WRAP_3 && blend.to === WRAP_2) return 1 - blend.t
  if (blend.to >= WRAP_3 || blend.from >= WRAP_3) return 1
  return 0
}

/**
 * Scene 2→3 (cover 0→1, reverse via 1−t):
 *  Phase A  0.00–0.55  Wrap-2 statement + future rise together and fade
 *  Phase B  0.48–1.00  Scene 3 lists + footer fade in (after outgoing is mostly clear)
 */
function scene3Motion(cover, reduced) {
  const exitMove = reduced
    ? rangeProgress(cover, 0, 0.55)
    : easeInOutQuint(rangeProgress(cover, 0, 0.55))
  const exitFade = reduced
    ? rangeProgress(cover, 0.05, 0.52)
    : easeInOutQuint(rangeProgress(cover, 0.05, 0.52))
  const scene3In = reduced
    ? rangeProgress(cover, 0.48, 1)
    : easeInOutQuint(rangeProgress(cover, 0.48, 1))
  return {
    exitY: lerp(0, SCENE3_EXIT_Y_CQH, exitMove),
    exitOpacity: 1 - exitFade,
    scene3Opacity: scene3In,
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
          futureY={0}
          wrap2Opacity={1}
          scene3Opacity={0}
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
  futureY,
  wrap2Opacity,
  scene3Opacity,
}) {
  return (
    <>
      <div className={styles.bgSlot} style={{ opacity: bgOpacity }}>
        <GradientStage />
      </div>

      <div style={{ opacity: textOpacity }} aria-hidden={textOpacity < 0.05}>
        <h2 className={styles.eyebrow}>Wrap up</h2>

        <div
          style={{ opacity: wrap2Opacity }}
          aria-hidden={wrap2Opacity < 0.05}
        >
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
              transform: `translate3d(0, ${futureY}cqh, 0)`,
            }}
            aria-hidden={futureOpacity < 0.05}
          >
            <p className={styles.futureHeading}>If I had more time...</p>
            <p className={styles.futureBody}>{FUTURE_BODY}</p>
          </div>
        </div>

        <div
          className={styles.lists}
          style={{
            top: `${S3_LISTS_TOP}cqh`,
            opacity: scene3Opacity,
            pointerEvents: scene3Opacity > 0.6 ? 'auto' : 'none',
          }}
          aria-hidden={scene3Opacity < 0.05}
        >
          <div className={styles.toolsCol}>
            <p className={styles.listTitle}>Tools:</p>
            <ul className={styles.list}>
              {TOOLS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className={styles.quickCol}>
            <p className={styles.listTitle}>Links:</p>
            <ul className={`${styles.list} ${styles.quickLink}`}>
              <li>
                <a
                  href={PROTOTYPE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
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

        <footer
          className={styles.footer}
          style={{
            top: `${S3_FOOTER_TOP}cqh`,
            opacity: scene3Opacity,
            pointerEvents: scene3Opacity > 0.6 ? 'auto' : 'none',
          }}
          aria-hidden={scene3Opacity < 0.05}
        >
          <span>Mia Meng, Product Designer</span>
          <BackToTop />
          <span className={styles.copyright}>©2026, All Rights Reserved</span>
        </footer>
      </div>
    </>
  )
}

function CinematicWrap({ reduced }) {
  const blend = useSceneBlend()
  const presence = exit06to07T(blend)
  const cover2 = scene2CoverT(blend)
  const cover3 = scene3CoverT(blend)
  const involved =
    presence > 0.001 ||
    cover2 > 0.001 ||
    cover3 > 0.001 ||
    (blend.settled &&
      blend.sceneIndex >= WRAP_1 &&
      blend.sceneIndex <= WRAP_3) ||
    (!blend.settled &&
      ((blend.from === BEHIND_2 && blend.to === WRAP_1) ||
        (blend.from === WRAP_1 && blend.to === BEHIND_2) ||
        (blend.from >= WRAP_1 &&
          blend.from <= WRAP_3 &&
          blend.to >= WRAP_1 &&
          blend.to <= WRAP_3)))

  if (!involved) {
    return null
  }

  const enter = enterMotion(presence, reduced)
  const scene2 = scene2Motion(cover2, reduced)
  const scene3 = scene3Motion(cover3, reduced)

  return (
    <section
      className={styles.phaseLayer}
      aria-label="Wrap up"
      style={{
        pointerEvents: presence > 0.85 ? 'auto' : 'none',
      }}
      aria-hidden={presence < 0.05}
    >
      <WrapChrome
        bgOpacity={enter.bgOpacity}
        textOpacity={enter.textOpacity}
        statementY={scene2.statementY + scene3.exitY}
        futureOpacity={scene2.futureOpacity}
        futureY={scene3.exitY}
        wrap2Opacity={scene3.exitOpacity}
        scene3Opacity={scene3.scene3Opacity}
      />
    </section>
  )
}

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
        const cover2 = rangeProgress(p, 0, 0.45)
        const cover3 = rangeProgress(p, 0.45, 1)
        const scene2 = scene2Motion(cover2, reduced)
        const scene3 = scene3Motion(cover3, reduced)
        return (
          <WrapChrome
            bgOpacity={1}
            textOpacity={1}
            statementY={scene2.statementY + scene3.exitY}
            futureOpacity={scene2.futureOpacity}
            futureY={scene3.exitY}
            wrap2Opacity={scene3.exitOpacity}
            scene3Opacity={scene3.scene3Opacity}
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
          <p className={styles.listTitle}>Links:</p>
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
