import { useRef } from 'react'
import ScrollCue from '../../components/ScrollCue'
import { HERO_TRACK_VH } from '../../config/layout'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useScrollProgress } from '../../hooks/useScrollProgress'
import { img } from '../../lib/assets'
import styles from './Hero.module.css'

/**
 * Full-screen Hero card. On desktop the whole artwork (one rigid image) translates
 * upward as a function of local scroll progress to reveal Section 02 underneath.
 * No per-element motion inside the card. Mobile keeps normal document flow.
 */
function Hero() {
  const trackRef = useRef(null)
  const isMobile = useMediaQuery('(max-width: 767px)')
  const progress = useScrollProgress(trackRef, { enabled: !isMobile })

  if (isMobile) {
    return (
      <section id="hero" className={styles.heroFlow} aria-label="Hero">
        <h1 className="sr-only">Instagram Collection Redesign</h1>
        <img
          className={styles.bg}
          src={img('01 Hero asset/01 Hero bg.png')}
          alt=""
          aria-hidden="true"
        />
        <ScrollCue />
      </section>
    )
  }

  const translateY = `${-progress * 100}vh`

  return (
    <section
      id="hero"
      ref={trackRef}
      className={styles.track}
      style={{ height: `${HERO_TRACK_VH}vh` }}
      aria-label="Hero"
    >
      <div className={styles.card} style={{ transform: `translateY(${translateY})` }}>
        <h1 className="sr-only">Instagram Collection Redesign</h1>
        <img
          className={styles.bg}
          src={img('01 Hero asset/01 Hero bg.png')}
          alt=""
          aria-hidden="true"
        />
        <ScrollCue />
      </div>
    </section>
  )
}

export default Hero
