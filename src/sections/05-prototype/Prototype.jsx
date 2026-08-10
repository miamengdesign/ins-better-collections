import Stage from '../../components/Stage'
import GradientStage from '../../components/GradientStage'
import CalloutCard from '../../components/CalloutCard'
import { img } from '../../lib/assets'
import { PROTOTYPE_URL } from '../../config/links'
import styles from './Prototype.module.css'

/**
 * Hover scale/elevation on the mockup link and the 04->05 push entrance are
 * implemented in a later pass — see ANIMATION_SPEC.md §05. The click-through
 * itself (the only real interactivity required in this pass) is wired now.
 *
 * `05 Prototype bg.svg` bakes the eyebrow and heading in as outlined vector text
 * on top of the panel-split background. That background has to stretch
 * independently per axis to stay pixel-aligned with the canvas, which visibly
 * deformed those glyphs, so it is not used: the shared gradient plus a CSS panel
 * reproduce the same background (same 1087px width and 80px corner radius) and
 * the copy is real HTML — the same approach Section 04 already takes.
 */
function Prototype() {
  return (
    <Stage className={styles.section} aria-label="Prototype">
      <GradientStage />
      <div className={styles.panel} />

      <div className={styles.mockup}>
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

      <p className={styles.eyebrow}>Prototype</p>
      <h2 className={styles.heading}>Click the Mockup, try it by yourself!</h2>
    </Stage>
  )
}

export default Prototype
