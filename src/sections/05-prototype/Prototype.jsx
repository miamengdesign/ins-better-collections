import Stage from '../../components/Stage'
import FillBackground from '../../components/FillBackground'
import CalloutCard from '../../components/CalloutCard'
import { img } from '../../lib/assets'
import { PROTOTYPE_URL } from '../../config/links'
import styles from './Prototype.module.css'

/**
 * Hover scale/elevation on the mockup link and the 04->05 push entrance are
 * implemented in a later pass — see ANIMATION_SPEC.md §05. The click-through
 * itself (the only real interactivity required in this pass) is wired now.
 * `05 Prototype bg.svg` already bakes in the "Prototype" eyebrow/heading as
 * outlined vector text, so it carries the visible copy; the same copy is
 * repeated here as real, visually-hidden text for screen readers.
 */
function Prototype() {
  return (
    <Stage className={styles.section} aria-label="Prototype">
      <FillBackground name="05 Prototype bg.svg" />

      <div className="sr-only">
        <p>Prototype</p>
        <h2>Click the Mockup, try it by yourself!</h2>
      </div>

      <div className={styles.left}>
        <a
          className={styles.link}
          href={PROTOTYPE_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open the interactive Figma prototype in a new tab"
        >
          <img className={styles.phone} src={img('05 Prototype pic.svg')} alt="" />
        </a>
        <CalloutCard className={styles.caption} src={img('05 Prototype txt.svg')} alt="Tap here to start" />
      </div>
    </Stage>
  )
}

export default Prototype
