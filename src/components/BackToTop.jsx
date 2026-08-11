import { useReducedMotion } from '../hooks/useReducedMotion'
import styles from './BackToTop.module.css'

/**
 * Footer control: smooth-scrolls to Section 01 Hero. "Back to top" text is
 * static; only the `⇡` runs a continuous upward conveyor loop (two clipped
 * copies, 50% phase offset). Reduced motion keeps a single static arrow.
 */
function BackToTop({ className = '' }) {
  const reduced = useReducedMotion()

  const scrollToHero = () => {
    document.getElementById('hero')?.scrollIntoView({
      behavior: reduced ? 'auto' : 'smooth',
    })
  }

  return (
    <button
      type="button"
      className={`${styles.button} ${className}`}
      onClick={scrollToHero}
      aria-label="Back to top"
    >
      <span
        className={`${styles.arrowWell} ${reduced ? styles.arrowStatic : ''}`}
        aria-hidden="true"
      >
        <span className={`${styles.arrow} ${styles.arrowA}`}>⇡</span>
        {!reduced && <span className={`${styles.arrow} ${styles.arrowB}`}>⇡</span>}
      </span>
      <span className={styles.label}>Back to top</span>
    </button>
  )
}

export default BackToTop
