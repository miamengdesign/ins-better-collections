import { useEffect } from 'react'
import GradientStage from './GradientStage'
import styles from './MobileFallback.module.css'

/**
 * Static phone viewport — geometry from `references/svg/Phone.svg` (402×874).
 * No cinematic navigator, gestures, or section content on mobile.
 */
function MobileFallback() {
  useEffect(() => {
    const { documentElement: root, body } = document
    const prevRootOverflow = root.style.overflow
    const prevBodyOverflow = body.style.overflow
    root.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    return () => {
      root.style.overflow = prevRootOverflow
      body.style.overflow = prevBodyOverflow
    }
  }, [])

  return (
    <main className={styles.screen} aria-label="Mobile notice">
      <GradientStage className={styles.gradient} />

      <p className={styles.message}>Please view on desktop.</p>

      <footer className={styles.footer}>
        <span className={styles.footerLeft}>Mia Meng, Product Designer</span>
        <span className={styles.footerRight}>©2026, All Rights Reserved</span>
      </footer>
    </main>
  )
}

export default MobileFallback
