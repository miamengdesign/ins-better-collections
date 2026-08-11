import { useSyncExternalStore } from 'react'

/** Shared §04→05 push playhead `0–1` so both panels stay locked under cinematic control. */
let pushT = 0
const listeners = new Set()

function emit() {
  listeners.forEach((l) => l())
}

export function setSolutionsPushT(t) {
  const next = Math.min(1, Math.max(0, t))
  if (Math.abs(next - pushT) < 0.0005) return
  pushT = next
  emit()
}

export function getSolutionsPushT() {
  return pushT
}

function subscribe(cb) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export function useSolutionsPushT() {
  return useSyncExternalStore(subscribe, getSolutionsPushT, () => 0)
}
