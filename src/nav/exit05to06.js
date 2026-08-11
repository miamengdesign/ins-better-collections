import { SCENE_INDEX } from './scenes'

const PROTO = SCENE_INDEX['proto']
const BEHIND_1 = SCENE_INDEX['behind-1']

/**
 * §05→06 exit playhead 0→1 (reverse via 1−t).
 * Shared by Prototype, Behind the Work, and SharedStageBackground so Phases
 * A–D stay locked to one navigator timeline.
 *
 * behind-1 ↔ behind-2 keeps this at 1 (section fully entered; veil is separate).
 */
export function exit05to06T(blend) {
  if (blend.settled) {
    return blend.sceneIndex >= BEHIND_1 ? 1 : 0
  }
  if (blend.from === PROTO && blend.to === BEHIND_1) return blend.t
  if (blend.from === BEHIND_1 && blend.to === PROTO) return 1 - blend.t
  if (blend.to >= BEHIND_1 || blend.from >= BEHIND_1) return 1
  return 0
}
