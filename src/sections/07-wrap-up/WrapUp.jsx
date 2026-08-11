import BackToTop from '../../components/BackToTop'
import GradientStage from '../../components/GradientStage'
import PinnedStage from '../../components/PinnedStage'
import { GITHUB_URL, PROTOTYPE_URL, VERCEL_URL } from '../../config/links'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useHandoff06to07 } from '../../lib/handoff06to07'
import { clamp, easeInOutQuint, lerp, rangeProgress } from '../../lib/motion'
import styles from './WrapUp.module.css'

/**
 * Three cinematic scenes from `07 Wrapup {1,2,3}` SVG path geometry (1728×1117).
 *
 * Scene 1→2: statement rises to Wrapup-2 resting top (20.85cqh) and STOPS;
 *            then “If I had more time…” fades in at 61.85cqh.
 * Scene 2→3: statement + future rise together and fade; Tools/Quick Link/footer settle.
 *
 * §06→07: background appears first, then text (from shared handoff playhead).
 */

const PIN_TRACK_VH = 220
const OVERLAP_VH = 100

const ANCHORS = [0, 0.45, 1]
const DURATIONS = [1600, 1800]

/** Tops in cqh from SVG path bboxes. */
const S1 = { statementTop: 43.903 }
const S2 = { statementTop: 20.85, futureTop: 61.853 }
const S3 = {
  statementTop: -18,
  futureTop: -14,
  listsTop: 42.426,
  footerTop: 90.886,
}

const TOOLS = ['Figma', 'Claude Code', 'Cursor', 'ChatGPT Codex', 'Github', 'Vercel']

function layoutAt(p, reduced) {
  if (reduced) {
    if (p < 0.33) return { ...S1, futureTop: 118, futureOpacity: 0, listsTop: 145, footerTop: 168, scene3: 0 }
    if (p < 0.66) {
      return {
        statementTop: S2.statementTop,
        futureTop: S2.futureTop,
        futureOpacity: 1,
        listsTop: 128,
        footerTop: 150,
        scene3: 0,
      }
    }
    return {
      statementTop: S3.statementTop,
      futureTop: S3.futureTop,
      futureOpacity: 0,
      listsTop: S3.listsTop,
      footerTop: S3.footerTop,
      scene3: 1,
    }
  }

  // Scene 1 hold → Scene 2
  if (p <= 0.02) {
    return {
      statementTop: S1.statementTop,
      futureTop: 118,
      futureOpacity: 0,
      listsTop: 145,
      footerTop: 168,
      scene3: 0,
      statementOpacity: 1,
    }
  }
  if (p < 0.45) {
    // Rise to Wrapup-2 resting top, then hold while future copy fades in.
    const t = easeInOutQuint(rangeProgress(p, 0.02, 0.28))
    const futureT = easeInOutQuint(rangeProgress(p, 0.3, 0.45))
    return {
      statementTop: lerp(S1.statementTop, S2.statementTop, t),
      futureTop: S2.futureTop,
      futureOpacity: futureT,
      listsTop: 145,
      footerTop: 168,
      scene3: 0,
      statementOpacity: 1,
    }
  }

  // Scene 2 → Scene 3
  const t = easeInOutQuint(rangeProgress(p, 0.45, 0.85))
  const fadeOut = easeInOutQuint(rangeProgress(p, 0.45, 0.7))
  const scene3In = easeInOutQuint(rangeProgress(p, 0.62, 1))
  return {
    statementTop: lerp(S2.statementTop, S3.statementTop, t),
    futureTop: lerp(S2.futureTop, S3.futureTop, t),
    futureOpacity: 1 - fadeOut,
    statementOpacity: 1 - fadeOut,
    listsTop: lerp(120, S3.listsTop, scene3In),
    footerTop: lerp(140, S3.footerTop, scene3In),
    scene3: scene3In,
  }
}

function WrapUp() {
  const reduced = useReducedMotion()
  const from06 = useHandoff06to07()

  return (
    <PinnedStage
      className={styles.section}
      ariaLabel="Wrap up"
      height={`calc(${OVERLAP_VH}vh + ${PIN_TRACK_VH}vh)`}
      overlapVh={OVERLAP_VH}
      startOffsetVh={0}
      style={{ zIndex: from06 >= 0.999 ? 6 : 0 }}
      cinematic={{
        anchors: ANCHORS,
        durations: DURATIONS,
        duration: 1600,
        reduced,
      }}
    >
      {({ progress, isPinned }) => {
        if (!isPinned) {
          return <MobileStack />
        }

        const p = clamp(progress, 0, 1)
        const layout = layoutAt(p, reduced)

        // §06→07: background settles first; copy follows — never simultaneous.
        const entered = from06 >= 0.999 || reduced
        const bgT = reduced ? 1 : easeInOutQuint(rangeProgress(from06, 0.28, 0.58))
        const textT = reduced ? 1 : easeInOutQuint(rangeProgress(from06, 0.58, 1))
        const stageBg = entered ? 1 : bgT
        const stageText = entered ? 1 : textT

        return (
          <>
            <div style={{ opacity: stageBg }}>
              <GradientStage />
            </div>

            <div style={{ opacity: stageText }}>
              <h2 className={styles.eyebrow}>Wrap up</h2>

              <p
                className={styles.paragraph}
                style={{
                  top: `${layout.statementTop}cqh`,
                  opacity: layout.statementOpacity ?? 1,
                }}
              >
                This redesign does not add an entirely new system.
                <br />
                It <strong>strengthens the existing Collection experience</strong> by
                <br />
                making saving consistent and collaboration flexible over time.
              </p>

              <div
                className={styles.future}
                style={{
                  top: `${layout.futureTop}cqh`,
                  opacity: layout.futureOpacity,
                }}
              >
                <p className={styles.futureHeading}>If I had more time...</p>
                <p className={styles.futureBody}>
                  I would validate the redesigned flow with users and explore shared
                  notes, smarter collection organization and clearer collaboration
                  permissions.
                </p>
              </div>

              <div
                className={styles.lists}
                style={{
                  top: `${layout.listsTop}cqh`,
                  opacity: layout.scene3,
                  pointerEvents: layout.scene3 > 0.6 ? 'auto' : 'none',
                }}
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
                  <p className={styles.listTitle}>Quick Link:</p>
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
                  top: `${layout.footerTop}cqh`,
                  opacity: layout.scene3,
                }}
              >
                <span>Mia Meng, Product Designer</span>
                <BackToTop />
                <span className={styles.copyright}>©2026, All Rights Reserved</span>
              </footer>
            </div>
          </>
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
      <p className={styles.paragraphStatic}>
        This redesign does not add an entirely new system.
        <br />
        It <strong>strengthens the existing Collection experience</strong> by
        <br />
        making saving consistent and collaboration flexible over time.
      </p>
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
