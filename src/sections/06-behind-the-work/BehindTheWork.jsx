import Stage from '../../components/Stage'
import { img } from '../../lib/assets'
import styles from './BehindTheWork.module.css'

/**
 * Static first state. The one-shot dark-overlay + second-paragraph reveal
 * (IntersectionObserver + 2s timer, non-reversible) is implemented in a later
 * pass — see ANIMATION_SPEC.md §06. Same pic1-4 assets are reused for that
 * state, so no new markup is needed to add it.
 */
function BehindTheWork() {
  return (
    <Stage className={styles.section} aria-label="Behind the Work">
      <div className={styles.collage} aria-hidden="true">
        <img className={styles.pic1} src={img('06 Behind 1 pic1.svg')} alt="" />
        <img className={styles.pic2} src={img('06 Behind 1 pic2.svg')} alt="" />
        <img className={styles.pic3} src={img('06 Behind 1 pic3.svg')} alt="" />
        <img className={styles.pic4} src={img('06 Behind 1 pic4.svg')} alt="" />
      </div>

      <div className={styles.text}>
        <h2 className={styles.eyebrow}>Behind the Work</h2>
        <p className={styles.paragraph}>The clean flow started on messy pages…</p>
      </div>
    </Stage>
  )
}

export default BehindTheWork
