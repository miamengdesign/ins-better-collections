import Stage from '../../components/Stage'
import GradientStage from '../../components/GradientStage'
import styles from './WhyCollection.module.css'

/**
 * Static first state of the pinned scroll-driven reveal (large centered heading).
 * The continuous-interpolation relay through the four narrative statements and the
 * heading's demotion to a small upper-left label are implemented in a later pass —
 * see ANIMATION_SPEC.md §02. Structure below is built so that pass needs no DOM changes.
 */
function WhyCollection() {
  return (
    <Stage className={styles.section} aria-label="Why Collection">
      <GradientStage />
      <h2 className={styles.heading}>Why Collection?</h2>
    </Stage>
  )
}

export default WhyCollection
