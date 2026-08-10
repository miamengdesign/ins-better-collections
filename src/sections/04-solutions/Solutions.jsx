import Stage from '../../components/Stage'
import GradientStage from '../../components/GradientStage'
import PhoneMockup from '../../components/PhoneMockup'
import CalloutCard from '../../components/CalloutCard'
import { img } from '../../lib/assets'
import styles from './Solutions.module.css'

/**
 * Static first state (Solution 01). States 02/03 and the pinned crossfade between
 * them — plus the 03->04 and 04->05 handoffs — are implemented in a later pass;
 * see ANIMATION_SPEC.md §04.
 *
 * Copy is real HTML at fixed px sizes (not cqw/cqh-scaled) so it never stretches
 * with the canvas — `04 Solution bg.svg`'s baked-in text was dropped for this
 * reason (its non-uniform per-axis stretch, needed to keep the panel-split
 * background pixel-aligned with the phone, was visibly distorting the glyphs).
 * The white/dark panel split is recreated in CSS instead (`.right`'s background +
 * rounded corners), and the shared plain gradient (no baked text) is used for the
 * full-bleed backdrop.
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
          <p className={styles.explanation}>
            Users can easily find the <strong>Collection option</strong> in the Reel{' '}
            <strong>detail view</strong>, keeping the experience <strong>consistent</strong> across all
            content formats.
          </p>
        </div>
      </div>

      <div className={styles.right}>
        <PhoneMockup
          className={styles.phone}
          src={img('04 Solution 1 pic.svg')}
          alt="Reel detail view with a Collection save option"
        />
        <CalloutCard
          className={styles.caption}
          src={img('04 Solution 1 txt.svg')}
          alt="Tap Collection to save a Reel"
        />
      </div>
    </Stage>
  )
}

export default Solutions
