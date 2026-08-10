import { img } from '../../lib/assets'
import styles from './Hero.module.css'

/**
 * Static full-screen artwork. The sticky scroll-exit (translateY -100vh into
 * Section 02) is not implemented in this pass — see ANIMATION_SPEC.md.
 */
function Hero() {
  return (
    <section id="hero" className={styles.hero} aria-label="Hero">
      <h1 className="sr-only">Instagram Collection Redesign</h1>
      <img className={styles.bg} src={img('01 Hero bg.svg')} alt="" aria-hidden="true" />
      <img
        className={styles.cue}
        src={img('⇣ Scroll down to continue.png')}
        alt="Scroll down to continue"
      />
    </section>
  )
}

export default Hero
