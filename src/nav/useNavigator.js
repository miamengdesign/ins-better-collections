import { useSyncExternalStore } from 'react'
import {
  getNavigatorSnapshot,
  goNext,
  goPrev,
  subscribeNavigator,
} from './navigatorStore'
import { SCENES } from './scenes'

export function useNavigator() {
  const snap = useSyncExternalStore(
    subscribeNavigator,
    getNavigatorSnapshot,
    getNavigatorSnapshot,
  )

  return {
    ...snap,
    scenes: SCENES,
    goNext,
    goPrev,
  }
}

/**
 * Blend helper: while transitioning from→to, `t` eases 0→1.
 * Otherwise settled at the current scene (t = 0 relative to a no-op).
 */
export function useSceneBlend() {
  const { sceneIndex, transition } = useNavigator()
  if (!transition) {
    return { from: sceneIndex, to: sceneIndex, t: 1, settled: true, sceneIndex }
  }
  return {
    from: transition.from,
    to: transition.to,
    t: transition.t,
    settled: false,
    sceneIndex,
  }
}
