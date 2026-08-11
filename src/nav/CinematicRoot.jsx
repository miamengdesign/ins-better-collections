import styles from './CinematicRoot.module.css'
import { useNavigator } from './useNavigator'

/**
 * Full-viewport cinematic host. Fixed while navigating; returns to document
 * flow once the phase-1 navigator unlocks the static tail.
 */
function CinematicRoot({ children }) {
  const { unlocked } = useNavigator()

  return (
    <div
      className={`${styles.root} ${unlocked ? styles.released : styles.locked}`}
      data-cinematic-root="true"
      data-unlocked={unlocked ? 'true' : 'false'}
    >
      <div className={styles.canvas}>{children}</div>
    </div>
  )
}

export default CinematicRoot
