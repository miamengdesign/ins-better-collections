import { useReducedMotion } from '../hooks/useReducedMotion'
import {
  getNavigatorSnapshot,
  resetNavigator,
} from '../nav/navigatorStore'
import styles from './BackToTop.module.css'

/**
 * Footer control: returns to Hero via the page navigator when cinematic is
 * locked; smooth-scrolls `#hero` only if the static tail is unlocked.
 * "Back to top" text is static; only the `⇡` runs a continuous upward conveyor
 * loop (two clipped copies, 50% phase offset). Reduced motion: static arrow.
 */
function BackToTop({ className = '' }) {
  const reduced = useReducedMotion()

  const goToHero = () => {
    const { unlocked } = getNavigatorSnapshot()
    if (!unlocked) {
      resetNavigator()
      return
    }
    document.getElementById('hero')?.scrollIntoView({
      behavior: reduced ? 'auto' : 'smooth',
    })
  }

  return (
    <button
      type="button"
      className={`${styles.button} ${className}`}
      onClick={goToHero}
      aria-label="Back to top"
    >
      <span
        className={`${styles.arrowWell} ${reduced ? styles.arrowStatic : ''}`}
        aria-hidden="true"
      >
        <span className={`${styles.arrow} ${styles.arrowA}`}>⇡</span>
        {!reduced && (
          <span className={`${styles.arrow} ${styles.arrowB}`}>⇡</span>
        )}
      </span>
      <span className={styles.label}>Back to top</span>
    </button>
  )
}

export default BackToTop
