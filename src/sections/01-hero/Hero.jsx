import { img } from '../../lib/assets'
import styles from './Hero.module.css'

/**
 * The complete Hero artwork, rendered as one runtime image — the collage, the
 * badges and the title are all baked into it, so it is never rebuilt from separate
 * elements. `object-fit: contain` keeps its native 6912x4468 aspect ratio: the
 * whole artwork is always visible, uncropped and never stretched.
 *
 * The sticky scroll-exit (the whole artwork translating up as one card into
 * Section 02) is not implemented in this pass — see ANIMATION_SPEC.md §01.
 */
function Hero() {
  return (
    <section id="hero" className={styles.hero} aria-label="Hero">
      <h1 className="sr-only">Instagram Collection Redesign</h1>
      <img
        className={styles.bg}
        src={img('01 Hero asset/01 Hero bg.png')}
        alt=""
        aria-hidden="true"
      />
    </section>
  )
}

export default Hero
