import { clamp } from '../lib/motion'
import { LAST_CINEMATIC_INDEX, SCENES } from './scenes'

/**
 * Single page-level cinematic navigator.
 * Sections subscribe and render from `{ sceneIndex, transition }`.
 */

let sceneIndex = 0
/** @type {null | { from: number, to: number, t: number }} */
let transition = null
let animating = false
/** After the last cinematic scene, native page scroll is allowed for the tail. */
let unlocked = false
let raf = 0

const listeners = new Set()

/** Cached snapshot — must be referentially stable between emits. */
let snapshot = buildSnapshot()

function buildSnapshot() {
  return {
    sceneIndex,
    scene: SCENES[sceneIndex],
    transition,
    animating,
    unlocked,
    sceneCount: SCENES.length,
  }
}

function emit() {
  snapshot = buildSnapshot()
  listeners.forEach((fn) => {
    try {
      fn()
    } catch (err) {
      // A subscriber throw must not kill the transition RAF chain
      // (would leave animating=true and freeze the current scene).
      console.error(err)
    }
  })
}

function getDuration(fromIndex, toIndex, reduced) {
  if (reduced) return 1
  const forward = toIndex > fromIndex
  // Reverse uses the duration of the scene we are leaving (entered with).
  const ms = forward
    ? SCENES[toIndex].enterMs
    : SCENES[fromIndex].enterMs || SCENES[toIndex].enterMs || 900
  return Math.max(ms, 1)
}

function tickTransition(from, to, duration, onDone) {
  if (raf) cancelAnimationFrame(raf)
  animating = true
  transition = { from, to, t: 0 }
  emit()
  const start = performance.now()

  const step = (now) => {
    const u = clamp((now - start) / duration, 0, 1)
    if (u < 1) {
      // Store linear progress; sections apply their own easing once.
      transition = { from, to, t: u }
      emit()
      raf = requestAnimationFrame(step)
    } else {
      // Commit settled ownership before notify so input eligibility and
      // section relays agree on the same snapshot (no t=1 + animating hole).
      raf = 0
      sceneIndex = to
      transition = null
      animating = false
      emit()
      onDone?.()
    }
  }
  raf = requestAnimationFrame(step)
}

export function getNavigatorSnapshot() {
  return snapshot
}

export function subscribeNavigator(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

/**
 * Advance one logical scene. Returns false if ignored.
 */
export function goNext({ reduced = false } = {}) {
  if (animating) return false

  if (unlocked) return false

  if (sceneIndex >= LAST_CINEMATIC_INDEX) {
    unlocked = true
    emit()
    return true
  }

  const from = sceneIndex
  const to = from + 1
  const duration = getDuration(from, to, reduced)
  tickTransition(from, to, duration)
  return true
}

/**
 * Reverse one logical scene. Returns false if ignored.
 */
export function goPrev({ reduced = false } = {}) {
  if (animating) return false

  if (unlocked) {
    // Re-enter cinematic control only when the page is back at the top.
    if (typeof window !== 'undefined' && window.scrollY > 4) return false
    unlocked = false
    emit()
    // Fall through to reverse from last cinematic scene.
  }

  if (sceneIndex <= 0) return false

  const from = sceneIndex
  const to = from - 1
  const duration = getDuration(from, to, reduced)
  tickTransition(from, to, duration)
  return true
}

/** Test/helper reset. */
export function resetNavigator() {
  if (raf) cancelAnimationFrame(raf)
  raf = 0
  sceneIndex = 0
  transition = null
  animating = false
  unlocked = false
  emit()
}
