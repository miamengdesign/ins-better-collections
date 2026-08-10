import { img } from '../../lib/assets'
import styles from './Hero.module.css'

/**
 * Static full-viewport artwork. Uses the flattened `01 Hero.png` reference directly
 * (per explicit direction) rather than the decomposed SVG, sized with object-fit:
 * contain so the entire image is always visible, letterboxed in white, never cropped,
 * never causing the section to scroll internally.
 *
 * Unlike `01 Hero bg.svg`, this flattened PNG already bakes in the "Scroll down to
 * continue" cue (confirmed by inspection) — a separate overlay image would duplicate
 * it, so none is rendered here. The sticky scroll-exit (translateY -100vh into
 * Section 02) is not implemented in this pass — see ANIMATION_SPEC.md.
 */
function Hero() {
  return (
    <section id="hero" className={styles.hero} aria-label="Hero">
      <h1 className="sr-only">Instagram Collection Redesign</h1>
      <img className={styles.bg} src={img('01 Hero.png', 'references')} alt="" aria-hidden="true" />
    </section>
  )
}

export default Hero
