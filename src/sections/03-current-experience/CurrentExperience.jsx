import Stage from '../../components/Stage'
import GradientStage from '../../components/GradientStage'
import PhoneMockup from '../../components/PhoneMockup'
import CalloutCard from '../../components/CalloutCard'
import { img } from '../../lib/assets'
import styles from './CurrentExperience.module.css'

/**
 * Three states, stacked as static full-screen blocks (no pinning/crossfade yet —
 * that comes in a later pass, see ANIMATION_SPEC.md §03). The header (title +
 * step-tracker + bullet) is a single flattened PNG per state rather than HTML
 * text, per direction — same reasoning as Solutions.jsx: a flattened raster can't
 * partially distort the way a stretched SVG's baked text could, and sizing it by
 * width only (height:auto) keeps it undistorted at any viewport.
 */
function CurrentExperienceState({ label, titleImg, children }) {
  return (
    <Stage className={styles.section} aria-label={label}>
      <GradientStage />
      <div className={styles.stack}>
        <header className={styles.header}>
          <img className={styles.headerImg} src={img(titleImg)} alt={label} />
        </header>
        <div className={styles.panel}>{children}</div>
      </div>
    </Stage>
  )
}

function CurrentExperience() {
  return (
    <>
      <CurrentExperienceState label="Current Experience 1" titleImg="03 Current Experience 1 Title.png">
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
          src={img('03 Current Experience 1 txt.png')}
          alt="UI Inconsistency: Main feed posts/reels display like, comment, share, and collection icons, but the collection icon hides in detail view."
        />
        <PhoneMockup
          className={styles.phone}
          src={img('03 Current Experience 1 pic3.svg')}
          alt="Reels detailed view"
        />
      </CurrentExperienceState>

      <CurrentExperienceState label="Current Experience 2" titleImg="03 Current Experience 2 Title.png">
        <PhoneMockup
          className={styles.phone}
          src={img('03 Current Experience 2 pic1.svg')}
          alt="Create new collection"
        />
        <PhoneMockup
          className={styles.phone}
          src={img('03 Current Experience 2 pic2.svg')}
          alt="Choose who to share with"
        />
        <div className={styles.calloutColumn}>
          <CalloutCard
            className={styles.callout}
            src={img('03 Current Experience 2 txt1.png')}
            alt="Blocked User Flow: When users enable Collaborative mode without selecting friends, they cannot proceed to the next step, creating a dead-end experience."
          />
          <CalloutCard
            className={styles.callout}
            src={img('03 Current Experience 2 txt2.png')}
            alt="Broken Collection Creation: Tapping Done on the keyboard, the interface dismisses but the collaborative collection fails to create. The post default saved to All Posts instead."
          />
          <CalloutCard
            className={styles.callout}
            src={img('03 Current Experience 2 txt3.png')}
            alt="Limited Collaboration: Each collection can only be shared with one person."
          />
        </div>
      </CurrentExperienceState>

      <CurrentExperienceState label="Current Experience 3" titleImg="03 Current Experience 3 Title.png">
        <PhoneMockup
          className={styles.phoneLarge}
          src={img('03 Current Experience 3 pic.svg')}
          alt="Manage the collection"
        />
        <CalloutCard
          className={styles.callout}
          src={img('03 Current Experience 3 txt.png')}
          alt="Missing Share Pathways: Users can only create collaborative collections from the main feed. Common use case blocked: sharing existing curated collections with friends retroactively is impossible."
        />
      </CurrentExperienceState>
    </>
  )
}

export default CurrentExperience
