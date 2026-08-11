/** Clamp `v` to `[min, max]`. */
export function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v))
}

/** Linear interpolate. */
export function lerp(a, b, t) {
  return a + (b - a) * t
}

/** Map `p` into a 0–1 window between `start` and `end`. */
export function rangeProgress(p, start, end) {
  if (end <= start) return p >= end ? 1 : 0
  return clamp((p - start) / (end - start), 0, 1)
}

export function easeOutCubic(t) {
  return 1 - (1 - t) ** 3
}

export function easeInCubic(t) {
  return t ** 3
}

export function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2
}

/**
 * Slight overshoot settle approximating `cubic-bezier(0.34, 1.2, 0.64, 1)` —
 * used for the §03→04 Solution panel entrance. Output may exceed 1 briefly.
 */
export function easeOutBack(t) {
  const c1 = 1.201
  const c3 = c1 + 1
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2
}

/**
 * Exit opacity curve from the animation spec: `1 → 0.35 → 0` across `t ∈ [0,1]`.
 */
export function exitOpacity(t) {
  if (t <= 0.5) return lerp(1, 0.35, t / 0.5)
  return lerp(0.35, 0, (t - 0.5) / 0.5)
}
