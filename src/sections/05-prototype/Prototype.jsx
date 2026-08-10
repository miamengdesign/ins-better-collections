import Stage from '../../components/Stage'
import GradientStage from '../../components/GradientStage'
import { img } from '../../lib/assets'
import { PROTOTYPE_URL } from '../../config/links'
import styles from './Prototype.module.css'

/**
 * Hover scale/elevation on the mockup link and the 04->05 push entrance are
 * implemented in a later pass — see ANIMATION_SPEC.md §05. The click-through
 * itself (the only real interactivity required in this pass) is wired now.
 *
 * `05 Prototype pic.png` is the section's one runtime asset and the only
 * clickable target. There is no background or caption asset: the panel split is
 * CSS over the shared GradientStage, and the eyebrow/heading are real HTML.
 */
function Prototype() {
  return (
    <Stage className={styles.section} aria-label="Prototype" background={<GradientStage />}>
      <div className={styles.panel} />

      <div className={styles.mockup}>
        <a
          className={styles.link}
          href={PROTOTYPE_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open the interactive Figma prototype in a new tab"
        >
          <img
            className={styles.phone}
            src={img('05 Prototype asset/05 Prototype pic.png')}
            alt=""
          />
        </a>
      </div>

      <p className={styles.eyebrow}>Prototype</p>
      <h2 className={styles.heading}>Click the Mockup, try it by yourself!</h2>
    </Stage>
  )
}

export default Prototype
