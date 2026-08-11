import { useSyncExternalStore } from 'react'

/** Shared §05→06 exit playhead `0–1`. */
let exitT = 0
const listeners = new Set()

function emit() {
  listeners.forEach((l) => l())
}

export function setExit05to06(t) {
  const next = Math.min(1, Math.max(0, t))
  if (Math.abs(next - exitT) < 0.0005) return
  exitT = next
  emit()
}

export function getExit05to06() {
  return exitT
}

function subscribe(cb) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export function useExit05to06() {
  return useSyncExternalStore(subscribe, getExit05to06, () => 0)
}
