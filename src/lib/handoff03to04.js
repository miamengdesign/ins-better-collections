import { useSyncExternalStore } from 'react'

/** Shared §03→04 handoff playhead `0–1` (card exit → text → 04 enter). */
let handoffT = 0
const listeners = new Set()

function emit() {
  listeners.forEach((l) => l())
}

export function setHandoff03to04(t) {
  const next = Math.min(1, Math.max(0, t))
  if (Math.abs(next - handoffT) < 0.0005) return
  handoffT = next
  emit()
}

export function getHandoff03to04() {
  return handoffT
}

function subscribe(cb) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export function useHandoff03to04() {
  return useSyncExternalStore(subscribe, getHandoff03to04, () => 0)
}
