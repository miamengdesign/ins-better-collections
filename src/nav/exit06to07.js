import { SCENE_INDEX } from './scenes'

const BEHIND_2 = SCENE_INDEX['behind-2']
const WRAP_1 = SCENE_INDEX['wrap-1']

/**
 * §06→07 exit playhead 0→1 (reverse via 1−t).
 * Shared by Behind the Work and Wrap Up so Phases A–D stay locked.
 */
export function exit06to07T(blend) {
  if (blend.settled) {
    return blend.sceneIndex >= WRAP_1 ? 1 : 0
  }
  if (blend.from === BEHIND_2 && blend.to === WRAP_1) return blend.t
  if (blend.from === WRAP_1 && blend.to === BEHIND_2) return 1 - blend.t
  if (blend.to >= WRAP_1 || blend.from >= WRAP_1) return 1
  return 0
}
