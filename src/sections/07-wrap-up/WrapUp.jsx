import { img } from '../../lib/assets'
import { GITHUB_URL, PROTOTYPE_URL, VERCEL_URL } from '../../config/links'
import BackToTop from '../../components/BackToTop'
import styles from './WrapUp.module.css'

/**
 * Normal document flow, no pinning/scroll-linked motion — matches the three
 * `07 Wrapup` reference snapshots as static positions, not animation states.
 */
function WrapUp() {
  return (
    <section className={styles.section} aria-label="Wrap up">
      <img className={styles.bg} src={img('02 Why Collections bg.svg')} alt="" aria-hidden="true" />

      <h2 className={styles.eyebrow}>Wrap up</h2>
      <p className={styles.paragraph}>
        This redesign does not add an entirely new system. It strengthens the existing Collection
        experience by making saving consistent and collaboration flexible over time.
      </p>

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
    </section>
  )
}

export default WrapUp
