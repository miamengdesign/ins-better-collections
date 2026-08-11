import GradientStage from '../components/GradientStage'
import { easeInOutQuint } from '../lib/motion'
import { SCENE_INDEX } from './scenes'
import { useSceneBlend } from './useNavigator'
import styles from './SharedStageBackground.module.css'

const WHY_TITLE = SCENE_INDEX['why-title']
const BAND_LAST = SCENE_INDEX['sol-3']

/**
 * Stationary brand gradient for the Why ↔ Current Experience ↔ Solutions band.
 * Opacity may fade when entering/leaving the band from Hero; position never
 * animates (no translate / page-flip during handoffs or internals).
 */
function sharedOpacity(blend) {
  if (blend.settled) {
    return blend.sceneIndex >= WHY_TITLE && blend.sceneIndex <= BAND_LAST
      ? 1
      : 0
  }

  const { from, to, t } = blend
  const inBand = (i) => i >= WHY_TITLE && i <= BAND_LAST
  const fromIn = inBand(from)
  const toIn = inBand(to)

  // why ↔ ce ↔ sol (and internals): fully on, never moves.
  if (fromIn && toIn) return 1

  // Hero → why: fade in with the stage (gradient stays put once visible).
  if (!fromIn && toIn) {
    return easeInOutQuint(Math.min(1, Math.max(0, (t - 0.35) / 0.65)))
  }

  // why → Hero: fade out.
  if (fromIn && !toIn) {
    return 1 - easeInOutQuint(Math.min(1, Math.max(0, t / 0.65)))
  }

  return 0
}

function SharedStageBackground() {
  const blend = useSceneBlend()
  const opacity = sharedOpacity(blend)

  if (opacity < 0.001) return null

  return (
    <div
      className={styles.bg}
      style={{ opacity }}
      aria-hidden="true"
      data-shared-stage-bg="true"
    >
      <GradientStage />
    </div>
  )
}

export default SharedStageBackground
