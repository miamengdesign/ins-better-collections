import { GITHUB_URL, PROTOTYPE_URL, VERCEL_URL } from '../../config/links'
import BackToTop from '../../components/BackToTop'
import GradientStage from '../../components/GradientStage'
import Stage from '../../components/Stage'
import styles from './WrapUp.module.css'

/**
 * Semantic HTML/CSS only — this section has no runtime image assets; its
 * background is the shared CSS GradientStage.
 *
 * Normal document flow, no pinning/scroll-linked motion — the two screens below are
 * the two the `07 Wrapup` references show as static positions, not animation
 * states: `07 Wrapup 1/2` (heading + closing statement) and `07 Wrapup 3` (the
 * Tools and Quick Link lists with the footer at the bottom of that same screen).
 * The footer is therefore part of the final screen, not a screen of its own.
 *
 * Each screen is a `Stage`, so its content lives on the same uniformly-scaled
 * 1728x1117 canvas as every other section — vertical rhythm is `cqh`, type is
 * `cqw`, and both track the one frame scale (no viewport-vs-container mixing).
 *
 * The closing statement's three lines are broken explicitly because that is how
 * they are set in the reference: its middle line ends well short of the longest
 * line, so no wrapping width can reproduce those breaks.
 */
function WrapUp() {
  return (
    <>
      <Stage aria-label="Wrap up" background={<GradientStage />}>
        <div className={styles.content}>
          <h2 className={styles.eyebrow}>Wrap up</h2>
          <p className={styles.paragraph}>
            This redesign does not add an entirely new system.
            <br />
            It strengthens the existing Collection experience by
            <br />
            making saving consistent and collaboration flexible over time.
          </p>
        </div>
      </Stage>

      <Stage aria-label="Wrap up — tools and links" background={<GradientStage />}>
        <div className={`${styles.content} ${styles.finalContent}`}>
          <div className={styles.lists}>
            <div>
              <p className={styles.listTitle}>Tools:</p>
              <ul className={styles.list}>
                <li>Figma</li>
                <li>Claude Code</li>
                <li>ChatGPT Codex</li>
                <li>Github</li>
                <li>Vercel</li>
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

          <footer className={styles.footer}>
            <span>Mia Meng, Product Designer</span>
            <BackToTop />
            <span>©2026, All Rights Reserved</span>
          </footer>
        </div>
      </Stage>
    </>
  )
}

export default WrapUp
