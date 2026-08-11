import styles from './CardNav.module.css'

/**
 * Subtle prev/next controls for evidence/solution light cards.
 * Calls the same cinematic goToStep path as wheel navigation.
 */
function CardNav({
  onPrev,
  onNext,
  disablePrev = false,
  disableNext = false,
  className = '',
}) {
  return (
    <div className={`${styles.nav} ${className}`} aria-hidden={false}>
      <button
        type="button"
        className={styles.btn}
        onClick={onPrev}
        disabled={disablePrev}
        aria-label="Previous state"
      >
        ‹
      </button>
      <button
        type="button"
        className={styles.btn}
        onClick={onNext}
        disabled={disableNext}
        aria-label="Next state"
      >
        ›
      </button>
    </div>
  )
}

export default CardNav
