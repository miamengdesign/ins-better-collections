import { useCallback, useEffect, useRef, useState } from 'react'
import { clamp, easeInOutQuint } from '../lib/motion'

export { useStageActive } from './useStageActive'

/**
 * Trigger-based cinematic playhead.
 *
 * A small wheel/trackpad gesture advances or reverses one step. Once triggered,
 * `progress` eases from the current anchor to the next over `duration` ms — the
 * user does not scrub the remainder. Input is locked while animating to prevent
 * double-fires and state skipping.
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
  threshold = 48,
  enabled = true,
}) {
  const [progress, setProgress] = useState(() => anchors[0] ?? 0)
  const [stepIndex, setStepIndex] = useState(0)
  const [animating, setAnimating] = useState(false)

  const anchorsRef = useRef(anchors)
  const progressRef = useRef(anchors[0] ?? 0)
  const stepRef = useRef(0)
  const animatingRef = useRef(false)
  const accRef = useRef(0)
  const rafRef = useRef(0)

  useEffect(() => {
    anchorsRef.current = anchors
  }, [anchors])

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
    [duration, durations, reduced],
  )

  useEffect(() => {
    if (!enabled || !active) {
      accRef.current = 0
      return undefined
    }

    const onWheel = (e) => {
      const list = anchorsRef.current
      const atStart = stepRef.current <= 0
      const atEnd = stepRef.current >= list.length - 1

      if (animatingRef.current) {
        e.preventDefault()
        return
      }

      if (e.deltaY > 0 && atEnd) return
      if (e.deltaY < 0 && atStart) return

      e.preventDefault()
      accRef.current += e.deltaY

      if (accRef.current >= threshold) {
        accRef.current = 0
        goToStep(stepRef.current + 1)
      } else if (accRef.current <= -threshold) {
        accRef.current = 0
        goToStep(stepRef.current - 1)
      }
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    return () => window.removeEventListener('wheel', onWheel)
  }, [active, enabled, goToStep, threshold])

  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
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
