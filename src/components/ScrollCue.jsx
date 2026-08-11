import { useReducedMotion } from '../hooks/useReducedMotion'
import styles from './ScrollCue.module.css'

/**
 * Hero "Scroll down to continue" cue. Opacity-only breathing loop; static when
 * `prefers-reduced-motion: reduce`. HTML/CSS overlay — not a shipped image.
 */
function ScrollCue() {
  const reduced = useReducedMotion()

  return (
    <p
      className={`${styles.cue} ${reduced ? styles.static : styles.breathe}`}
      aria-hidden="true"
    >
      <span className={styles.arrow}>↓</span> Scroll down to continue
    </p>
  )
}

export default ScrollCue
