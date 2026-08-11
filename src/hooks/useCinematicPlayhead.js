import { useCallback, useEffect, useRef, useState } from 'react'
import { clamp, easeInOutQuint } from '../lib/motion'
import {
  normalizeWheelDelta,
  WHEEL_DEAD_ZONE,
  WHEEL_GESTURE_IDLE_MS,
  WHEEL_INTENT_THRESHOLD,
} from '../lib/wheelIntent'

export { useStageActive } from './useStageActive'
export {
  normalizeWheelDelta,
  WHEEL_DEAD_ZONE,
  WHEEL_GESTURE_IDLE_MS,
  WHEEL_INTENT_THRESHOLD,
} from '../lib/wheelIntent'

/**
 * Trigger-based cinematic playhead.
 *
 * A small wheel/trackpad gesture advances or reverses one step. Once triggered,
 * `progress` eases from the current anchor to the next over `duration` ms — the
 * user does not scrub the remainder.
 *
 * Gesture model:
 * - light vertical intent (≥ threshold) triggers immediately
 * - the rest of that physical gesture is latched / swallowed (momentum ignored)
 * - only after an idle gap can another gesture fire
 *
 * At the first/last step, boundary wheel events are left alone so the page can
 * scroll to the neighbouring section.
 */
export function useCinematicPlayhead({
  anchors,
  active = false,
  reduced = false,
  duration = 1100,
  durations,
  threshold = WHEEL_INTENT_THRESHOLD,
  deadZone = WHEEL_DEAD_ZONE,
  idleMs = WHEEL_GESTURE_IDLE_MS,
  enabled = true,
}) {
  const [progress, setProgress] = useState(() => anchors[0] ?? 0)
  const [stepIndex, setStepIndex] = useState(0)
  const [animating, setAnimating] = useState(false)

  const anchorsRef = useRef(anchors)
  const progressRef = useRef(anchors[0] ?? 0)
  const stepRef = useRef(0)
  const animatingRef = useRef(false)
  const activeRef = useRef(active)
  const enabledRef = useRef(enabled)
  const accRef = useRef(0)
  const gestureLatchedRef = useRef(false)
  const idleTimerRef = useRef(0)
  const rafRef = useRef(0)

  activeRef.current = active
  enabledRef.current = enabled

  useEffect(() => {
    anchorsRef.current = anchors
  }, [anchors])

  const clearIdleTimer = () => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current)
      idleTimerRef.current = 0
    }
  }

  const scheduleGestureEnd = useCallback(() => {
    clearIdleTimer()
    idleTimerRef.current = window.setTimeout(() => {
      idleTimerRef.current = 0
      gestureLatchedRef.current = false
      accRef.current = 0
    }, idleMs)
  }, [idleMs])

  const goToStep = useCallback(
    (nextIndex) => {
      const list = anchorsRef.current
      if (animatingRef.current) return false
      if (nextIndex < 0 || nextIndex >= list.length) return false
      if (nextIndex === stepRef.current) return false

      const from = progressRef.current
      const to = list[nextIndex]
      const fromStep = stepRef.current
      const durList = durations
      const dur = reduced
        ? 1
        : (Array.isArray(durList)
            ? durList[Math.max(fromStep, nextIndex) - 1] ?? duration
            : duration)

      animatingRef.current = true
      setAnimating(true)
      stepRef.current = nextIndex
      setStepIndex(nextIndex)
      accRef.current = 0
      // Latch for the remainder of this physical gesture (and its momentum).
      gestureLatchedRef.current = true
      scheduleGestureEnd()

      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      const start = performance.now()

      const tick = (now) => {
        const u = clamp((now - start) / Math.max(dur, 1), 0, 1)
        const e = reduced ? u : easeInOutQuint(u)
        const value = from + (to - from) * e
        progressRef.current = value
        setProgress(value)
        if (u < 1) {
          rafRef.current = requestAnimationFrame(tick)
        } else {
          progressRef.current = to
          setProgress(to)
          animatingRef.current = false
          setAnimating(false)
          rafRef.current = 0
        }
      }
      rafRef.current = requestAnimationFrame(tick)
      return true
    },
    [duration, durations, reduced, scheduleGestureEnd],
  )

  // Landing on a stage mid-momentum must not auto-fire a step: latch until idle.
  useEffect(() => {
    if (!enabled || !active) {
      accRef.current = 0
      return undefined
    }
    gestureLatchedRef.current = true
    accRef.current = 0
    scheduleGestureEnd()
    return undefined
  }, [active, enabled, scheduleGestureEnd])

  useEffect(() => {
    if (!enabled) {
      accRef.current = 0
      gestureLatchedRef.current = false
      clearIdleTimer()
      return undefined
    }

    const onWheel = (e) => {
      if (!enabledRef.current) return

      // Pinch-zoom / ctrl-wheel — never treat as cinematic intent.
      if (e.ctrlKey) return

      const pageHeight =
        typeof window !== 'undefined' ? window.innerHeight : 800
      const { dx, dy } = normalizeWheelDelta(e, 16, pageHeight)

      if (!activeRef.current) return

      const list = anchorsRef.current
      const atStart = stepRef.current <= 0
      const atEnd = stepRef.current >= list.length - 1

      // Horizontal-dominant trackpad pans are not vertical stage intent.
      if (Math.abs(dx) > Math.abs(dy)) return

      // While animating, always swallow. After a trigger, swallow remaining
      // momentum from the same gesture — except outbound release at the ends
      // so the page can hand off to the next/previous section.
      if (animatingRef.current || gestureLatchedRef.current) {
        if (!animatingRef.current) {
          if (dy > 0 && atEnd) return
          if (dy < 0 && atStart) return
        }
        e.preventDefault()
        scheduleGestureEnd()
        return
      }

      // Boundary: release to native scroll so the next section can take over.
      if (dy > 0 && atEnd) return
      if (dy < 0 && atStart) return

      // Tiny per-event noise — ignore without capturing the gesture.
      if (Math.abs(dy) < deadZone) return

      e.preventDefault()
      scheduleGestureEnd()
      accRef.current += dy

      if (accRef.current >= threshold) {
        accRef.current = 0
        goToStep(stepRef.current + 1)
      } else if (accRef.current <= -threshold) {
        accRef.current = 0
        goToStep(stepRef.current - 1)
      }
    }

    // Stay attached whenever enabled so becoming-active does not miss the
    // next event while React commits. Gating uses activeRef (sync).
    window.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      window.removeEventListener('wheel', onWheel)
      clearIdleTimer()
    }
  }, [enabled, threshold, deadZone, goToStep, scheduleGestureEnd])

  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      clearIdleTimer()
    },
    [],
  )

  return {
    progress,
    stepIndex,
    animating,
    goToStep,
    stepCount: anchors.length,
  }
}
