import { useSyncExternalStore } from 'react'

/** Shared §06→07 handoff playhead `0–1`. */
let handoffT = 0
const listeners = new Set()

function emit() {
  listeners.forEach((l) => l())
}

export function setHandoff06to07(t) {
  const next = Math.min(1, Math.max(0, t))
  if (Math.abs(next - handoffT) < 0.0005) return
  handoffT = next
  emit()
}

export function getHandoff06to07() {
  return handoffT
}

function subscribe(cb) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export function useHandoff06to07() {
  return useSyncExternalStore(subscribe, getHandoff06to07, () => 0)
}
