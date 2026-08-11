import { useEffect } from 'react'
import ScrollCue from '../../components/ScrollCue'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { img } from '../../lib/assets'
import { easeInOutQuint, lerp } from '../../lib/motion'
import { SCENE_INDEX } from '../../nav/scenes'
import { useNavigator, useSceneBlend } from '../../nav/useNavigator'
import styles from './Hero.module.css'

const HERO_WEBP = img('01 Hero asset/01 Hero bg.webp')
const HERO_PNG = img('01 Hero asset/01 Hero bg.png')

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
 * Exit progress 0 = fully on screen, 1 = fully above viewport.
 * Driven by the shared navigator (hero → why-title), not local wheel ownership.
 */
function heroExitProgress(blend) {
  const hero = SCENE_INDEX.hero
  const whyTitle = SCENE_INDEX['why-title']

  if (blend.settled) {
    return blend.sceneIndex <= hero ? 0 : 1
  }

  if (blend.from === hero && blend.to === whyTitle) {
    return easeInOutQuint(blend.t)
  }
  if (blend.from === whyTitle && blend.to === hero) {
    return easeInOutQuint(1 - blend.t)
  }
  return blend.to > hero || blend.from > hero ? 1 : 0
}

function Hero() {
  const isMobile = useMediaQuery('(max-width: 767px)')
  const blend = useSceneBlend()
  const { sceneIndex } = useNavigator()
  const exit = heroExitProgress(blend)
  const visible = sceneIndex <= SCENE_INDEX['why-title'] || !blend.settled

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

  if (!visible && exit >= 1) {
    return <section id="hero" className={styles.slot} aria-hidden="true" />
  }

  const translateY = `${lerp(0, -100, exit)}vh`

  return (
    <section
      id="hero"
      className={styles.layer}
      aria-label="Hero"
      style={{
        transform: `translate3d(0, ${translateY}, 0)`,
        pointerEvents: exit > 0.98 ? 'none' : 'auto',
      }}
    >
      <div className={styles.card}>
        <h1 className="sr-only">Instagram Collection Redesign</h1>
        <HeroArt className={styles.bg} />
        <ScrollCue />
      </div>
    </section>
  )
}

export default Hero
