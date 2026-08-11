import BackToTop from '../../components/BackToTop'
import GradientStage from '../../components/GradientStage'
import PinnedStage from '../../components/PinnedStage'
import { GITHUB_URL, PROTOTYPE_URL, VERCEL_URL } from '../../config/links'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { clamp, lerp, rangeProgress } from '../../lib/motion'
import styles from './WrapUp.module.css'

/**
 * Section 07 — three scroll-driven states matching `references/svg|png/07 Wrapup {1,2,3}`.
 *
 * Geometry is taken from outlined text path bboxes in the SVGs (frame 1728×1117):
 * - "Wrap up" eyebrow stays fixed at the top-left in every state
 * - Closing statement rises from mid-frame (1) → upper (2) → exits above (3)
 * - "If I had more time…" enters from below into state 2, then exits above in 3
 * - Tools | Quick Link + footer rise into their state-3 resting positions
 *
 * Not three screenshots and not three separate pages — one sticky stage with
 * HTML elements interpolating between those keyframe tops.
 */

const PIN_TRACK_VH = 220

/** Tops in `cqh` (percent of the 1117px frame). */
const S1 = {
  statementTop: 43.903,
  futureTop: 118,
  listsTop: 145,
  footerTop: 168,
}

const S2 = {
  statementTop: 20.85,
  futureTop: 61.853,
  listsTop: 128,
  footerTop: 150,
}

const S3 = {
  statementTop: -22,
  futureTop: -18,
  listsTop: 42.426,
  footerTop: 90.886,
}

const TOOLS = ['Figma', 'Claude Code', 'Cursor', 'ChatGPT Codex', 'Github', 'Vercel']

function mix(a, b, t) {
  return {
    statementTop: lerp(a.statementTop, b.statementTop, t),
    futureTop: lerp(a.futureTop, b.futureTop, t),
    listsTop: lerp(a.listsTop, b.listsTop, t),
    footerTop: lerp(a.footerTop, b.footerTop, t),
  }
}

/** Continuous S1→S2→S3 with short holds at each designed state. */
function layoutAt(p, reduced) {
  if (reduced) {
    if (p < 1 / 3) return S1
    if (p < 2 / 3) return S2
    return S3
  }
  if (p <= 0.08) return S1
  if (p < 0.42) return mix(S1, S2, rangeProgress(p, 0.08, 0.42))
  if (p <= 0.52) return S2
  if (p < 0.92) return mix(S2, S3, rangeProgress(p, 0.52, 0.92))
  return S3
}

function WrapUp() {
  const reduced = useReducedMotion()

  return (
    <PinnedStage
      className={styles.section}
      ariaLabel="Wrap up"
      height={`calc(100vh + ${PIN_TRACK_VH}vh)`}
      startOffsetVh={0}
    >
      {({ progress, isPinned }) => {
        if (!isPinned) {
          return <MobileStack />
        }

        const p = clamp(progress, 0, 1)
        const layout = layoutAt(p, reduced)
        // Soft visibility so exiting copy does not linger as a ghost at the edge.
        const statementOpacity = layout.statementTop < -5 ? 0 : 1
        const futureOpacity =
          layout.futureTop > 100 || layout.futureTop < -5 ? 0 : 1
        const listsLive = layout.listsTop < 95 && layout.listsTop > 5

        return (
          <>
            <GradientStage />

            <h2 className={styles.eyebrow}>Wrap up</h2>

            <p
              className={styles.paragraph}
              style={{
                top: `${layout.statementTop}cqh`,
                opacity: statementOpacity,
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
                opacity: futureOpacity,
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
                pointerEvents: listsLive ? 'auto' : 'none',
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
              style={{ top: `${layout.footerTop}cqh` }}
            >
              <span>Mia Meng, Product Designer</span>
              <BackToTop />
              <span className={styles.copyright}>©2026, All Rights Reserved</span>
            </footer>
          </>
        )
      }}
    </PinnedStage>
  )
}

/** Mobile: pin disabled — full reading-order stack, no cinematic motion. */
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
