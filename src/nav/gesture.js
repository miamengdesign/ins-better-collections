/**
 * Mac trackpad gesture intent for the page-level navigator.
 * Directional trigger (not long scroll-distance accumulation).
 */
export const GESTURE_DEAD_ZONE = 1
/** Idle gap that ends a physical gesture (momentum may continue until then). */
export const GESTURE_IDLE_MS = 140

/**
 * Normalize wheel deltas to approximate CSS pixels.
 * deltaMode: 0 = pixel, 1 = line, 2 = page.
 */
export function normalizeWheelDelta(e, lineHeight = 16, pageHeight = 800) {
  let dx = e.deltaX
  let dy = e.deltaY
  if (e.deltaMode === 1) {
    dx *= lineHeight
    dy *= lineHeight
  } else if (e.deltaMode === 2) {
    dx *= pageHeight
    dy *= pageHeight
  }
  return { dx, dy }
}

/**
 * Returns `1` (down/next), `-1` (up/prev), or `0` (ignore).
 */
export function readVerticalIntent(e, deadZone = GESTURE_DEAD_ZONE) {
  if (e.ctrlKey) return 0
  const pageHeight = typeof window !== 'undefined' ? window.innerHeight : 800
  const { dx, dy } = normalizeWheelDelta(e, 16, pageHeight)
  if (Math.abs(dy) < deadZone) return 0
  if (Math.abs(dx) > Math.abs(dy)) return 0
  return dy > 0 ? 1 : -1
}
