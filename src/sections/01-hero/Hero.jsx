import { useEffect, useRef } from 'react'
import ScrollCue from '../../components/ScrollCue'
import { HERO_TRACK_VH } from '../../config/layout'
import { useCinematicPlayhead, useStageActive } from '../../hooks/useCinematicPlayhead'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { img } from '../../lib/assets'
import styles from './Hero.module.css'

const HERO_WEBP = img('01 Hero asset/01 Hero bg.webp')
const HERO_PNG = img('01 Hero asset/01 Hero bg.png')

/** Cinematic exit: settled → fully off-screen. */
const ANCHORS = [0, 1]
const EXIT_MS = 1200

function HeroArt({ className }) {
  return (
    <picture>
      <source srcSet={HERO_WEBP} type="image/webp" />
      <img
        className={className}
        src={HERO_PNG}
        alt=""
        aria-hidden="true"
        width={3456}
        height={2234}
        decoding="async"
        fetchPriority="high"
        loading="eager"
      />
    </picture>
  )
}

/**
 * Full-screen Hero card. A small downward gesture triggers a cinematic exit
 * (card translates up over ~1.2s). Not scrubbed 1:1 to scroll distance.
 * Mobile keeps normal document flow.
 */
function Hero() {
  const trackRef = useRef(null)
  const isMobile = useMediaQuery('(max-width: 767px)')
  const reduced = useReducedMotion()
  const active = useStageActive(trackRef, { enabled: !isMobile, zIndex: 10 })
  const { progress } = useCinematicPlayhead({
    anchors: ANCHORS,
    active,
    reduced,
    duration: EXIT_MS,
    enabled: !isMobile,
  })

  // Preload hero artwork as early as the component mounts (in addition to <head>).
  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = HERO_WEBP
    link.type = 'image/webp'
    link.fetchPriority = 'high'
    document.head.appendChild(link)
    return () => {
      link.remove()
    }
  }, [])

  if (isMobile) {
    return (
      <section id="hero" className={styles.heroFlow} aria-label="Hero">
        <h1 className="sr-only">Instagram Collection Redesign</h1>
        <HeroArt className={styles.bg} />
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
      data-cinematic="true"
    >
      <div className={styles.card} style={{ transform: `translateY(${translateY})` }}>
        <h1 className="sr-only">Instagram Collection Redesign</h1>
        <HeroArt className={styles.bg} />
        <ScrollCue />
      </div>
    </section>
  )
}

export default Hero
