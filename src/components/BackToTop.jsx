import styles from './BackToTop.module.css'

/** Static for this pass — the arrow's continuous upward-rolling loop is added later. */
function BackToTop({ className = '' }) {
  const scrollToHero = () => {
    document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <button type="button" className={`${styles.button} ${className}`} onClick={scrollToHero}>
      <span className={styles.arrow} aria-hidden="true">
        ⇡
      </span>
      <span>Back to top</span>
    </button>
  )
}

export default BackToTop
