import { useEffect, useRef } from 'react'
import { img } from '../../lib/assets'
import styles from './Hero.module.css'

/**
 * Static full-screen artwork. The sticky scroll-exit (translateY -100vh into
 * Section 02) is not implemented in this pass — see ANIMATION_SPEC.md.
 *
 * The bg asset is fetched and inlined as markup (instead of an <img src>) so the
 * `.bg svg` crispEdges rule in Hero.module.css can reach it — see that file for why.
 */
function HeroArtwork() {
  const hostRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    fetch(img('01 Hero bg.svg'))
      .then((res) => res.text())
      .then((svgMarkup) => {
        if (!cancelled && hostRef.current) {
          hostRef.current.innerHTML = svgMarkup
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  return <div ref={hostRef} className={styles.bg} role="img" aria-label="" />
}

function Hero() {
  return (
    <section id="hero" className={styles.hero} aria-label="Hero">
      <h1 className="sr-only">Instagram Collection Redesign</h1>
      <div className={styles.frame}>
        <HeroArtwork />
      </div>
      <img
        className={styles.cue}
        src={img('⇣ Scroll down to continue.png')}
        alt="Scroll down to continue"
      />
    </section>
  )
}

export default Hero
