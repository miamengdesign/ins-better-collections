/**
 * Shared Mac trackpad / wheel intent helpers for cinematic playheads.
 *
 * Threshold is intentionally low so a light deliberate swipe fires once.
 * Dead zone only filters accidental noise. Idle gap ends a physical gesture
 * so momentum cannot chain into a second step.
 */

/** Normalized px of vertical intent required to trigger one step (range ~6–10). */
export const WHEEL_INTENT_THRESHOLD = 8

/** Per-event noise floor after normalization — below this, ignore. */
export const WHEEL_DEAD_ZONE = 1.25

/** No wheel events for this long ⇒ gesture ended; a new swipe may fire. */
export const WHEEL_GESTURE_IDLE_MS = 140

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
