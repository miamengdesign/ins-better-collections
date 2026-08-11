import Stage from '../../components/Stage'
import GradientStage from '../../components/GradientStage'
import PhoneMockup from '../../components/PhoneMockup'
import { img } from '../../lib/assets'
import styles from './Solutions.module.css'

/**
 * Static first state (Solution 01). Solutions 02/03 (`04 Solution {2,3} pic.png`)
 * and the pinned crossfade between them — plus the 03->04 and 04->05 handoffs —
 * are implemented in a later pass; see ANIMATION_SPEC.md §04.
 *
 * There is one runtime PNG per solution state and no separate background or
 * caption asset: the annotation beside the phone and the caption beneath it are
 * both baked into `04 Solution 1 pic.png`, so neither is repeated as HTML. The
 * white/dark panel split is CSS (`.right`), the backdrop is the shared
 * GradientStage, and the left column is real HTML text.
 */
function Solutions() {
  return (
    <Stage className={styles.section} aria-label="Solutions">
      <GradientStage />

      <div className={styles.left}>
        <p className={styles.eyebrow}>Solution 01</p>
        <h2 className={styles.heading}>Reels Detail Enhancement</h2>
        <div className={styles.badgeGroup}>
          <span className={styles.badge}>✅ Interface Consistency</span>
          {/* Broken where the reference breaks it. The card's 430px of content width
              is a hair wider than this copy needs at 20px, so left to wrap on its own
              it pulls "the" up onto the first line. */}
          <p className={styles.explanation}>
            Users can easily find the <strong>Collection option</strong> in
            <br />
            the Reel <strong>detail view</strong>, keeping the experience
            <br />
            <strong>consistent</strong> across all content formats.
          </p>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.mockup}>
          <PhoneMockup
            className={styles.phone}
            src={img('04 Solution asset/04 Solution 1 pic.png')}
            alt="Reel detail view with a Collection save option"
          />
        </div>
      </div>
    </Stage>
  )
}

export default Solutions
