import Stage from '../../components/Stage'
import FillBackground from '../../components/FillBackground'
import PhoneMockup from '../../components/PhoneMockup'
import CalloutCard from '../../components/CalloutCard'
import { img } from '../../lib/assets'
import styles from './Solutions.module.css'

/**
 * Static first state (Solution 01). States 02/03 and the pinned crossfade between
 * them — plus the 03->04 and 04->05 handoffs — are implemented in a later pass;
 * see ANIMATION_SPEC.md §04. `04 Solution bg.svg` already bakes in the "Solution 01"
 * eyebrow/heading/badge/paragraph as outlined vector text, so it carries the visible
 * copy; the same copy is repeated here as real, visually-hidden text for screen readers.
 */
function Solutions() {
  return (
    <Stage className={styles.section} aria-label="Solutions">
      <FillBackground name="04 Solution bg.svg" />

      <div className="sr-only">
        <p>Solution 01</p>
        <h2>Reels Detail Enhancement</h2>
        <p>✅ Interface Consistency</p>
        <p>
          Users can easily find the Collection option in the Reel detail view, keeping the experience
          consistent across all content formats.
        </p>
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
