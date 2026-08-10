import Stage from '../../components/Stage'
import GradientStage from '../../components/GradientStage'
import StepTracker from '../../components/StepTracker'
import PhoneMockup from '../../components/PhoneMockup'
import CalloutCard from '../../components/CalloutCard'
import { img } from '../../lib/assets'
import styles from './CurrentExperience.module.css'

/**
 * Static first state (State 1: Discover -> Save). States 2/3 and the pinned
 * crossfade between them are implemented in a later pass — see ANIMATION_SPEC.md §03.
 * The header/tracker/panel shell stay spatially identical across all three states
 * by design, so no restructuring will be needed to add the crossfade.
 */
function CurrentExperience() {
  return (
    <Stage className={styles.section} aria-label="Current Experience">
      <GradientStage />

      <div className={styles.stack}>
        <header className={styles.header}>
          <h2 className={styles.title}>Current Experience</h2>
          <StepTracker activeSteps={['Discover', 'Save']} dottedAfter="Save" />
          <p className={styles.bullet}>Users lose a familiar saving action when moving from feed to detail.</p>
        </header>

        <div className={styles.panel}>
          <PhoneMockup
            className={styles.phone}
            src={img('03 Current Experience 1 pic1.svg')}
            alt="Main feed, Reel view"
          />
          <PhoneMockup
            className={styles.phone}
            src={img('03 Current Experience 1 pic2.svg')}
            alt="Main feed, Post view"
          />
          <CalloutCard
            className={styles.callout}
            src={img('03 Current Experience 1 txt.svg')}
            alt="UI Inconsistency: Main feed posts/reels display like, comment, share, and collection icons, but the collection icon hides in detail view."
          />
          <PhoneMockup
            className={styles.phone3}
            src={img('03 Current Experience 1 pic3.svg')}
            alt="Reels detailed view"
          />
        </div>
      </div>
    </Stage>
  )
}

export default CurrentExperience
