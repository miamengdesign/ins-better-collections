import { useEffect, useLayoutEffect, useRef } from 'react'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { GESTURE_IDLE_MS, readVerticalIntent } from './gesture'
import {
  getNavigatorSnapshot,
  goNext,
  goPrev,
  subscribeNavigator,
} from './navigatorStore'
import { useNavigator } from './useNavigator'

/**
 * Single page-level wheel authority for the cinematic experience.
 * Sections do not attach their own wheel listeners.
 *
 * Ownership is read synchronously from navigatorStore inside the wheel
 * handler (not mirrored through React state) so a scene is input-eligible
 * as soon as its transition settles — no click/focus required.
 */
function GestureController() {
  const isMobile = useMediaQuery('(max-width: 767px)')
  const reduced = useReducedMotion()
  const reducedRef = useRef(reduced)
  reducedRef.current = reduced

  // Overflow lock only — wheel path does not use this React snapshot.
  const { unlocked } = useNavigator()

  useLayoutEffect(() => {
    if (isMobile) return undefined

    let latched = false
    let idleTimer = 0
    let lastWheelAt = 0
    let wasAnimating = getNavigatorSnapshot().animating

    const clearIdle = () => {
      if (idleTimer) {
        clearTimeout(idleTimer)
        idleTimer = 0
      }
    }

    const scheduleIdle = () => {
      clearIdle()
      idleTimer = window.setTimeout(() => {
        idleTimer = 0
        latched = false
      }, GESTURE_IDLE_MS)
    }

    const unsub = subscribeNavigator(() => {
      const { animating } = getNavigatorSnapshot()
      if (wasAnimating && !animating) {
        // Scene just became visually settled. Absorb residual trackpad
        // momentum from the gesture that started this transition — but only
        // if wheels are still streaming. A clean settle stays immediately
        // eligible for the next deliberate swipe (no click/focus needed).
        if (performance.now() - lastWheelAt < GESTURE_IDLE_MS) {
          latched = true
          scheduleIdle()
        }
      }
      wasAnimating = animating
    })

    const onWheel = (e) => {
      const intent = readVerticalIntent(e)
      if (intent === 0) return

      lastWheelAt = performance.now()

      // Synchronous store read — not React-mirrored refs (one commit late).
      const { animating, unlocked: isUnlocked } = getNavigatorSnapshot()

      // Tail unlocked: allow native scroll, except at the very top where
      // upward intent re-enters the cinematic navigator.
      if (isUnlocked) {
        if (intent < 0 && window.scrollY <= 4) {
          e.preventDefault()
          if (latched || animating) {
            scheduleIdle()
            return
          }
          latched = true
          scheduleIdle()
          goPrev({ reduced: reducedRef.current })
          return
        }
        latched = false
        return
      }

      // Cinematic lock: always take vertical intent.
      e.preventDefault()

      // During a timeline: swallow momentum without extending the post-gesture
      // latch. Extending idle here was holding the latch for the entire Mac
      // coast, so the first deliberate §02 swipe after settle was discarded.
      if (animating) {
        return
      }

      if (latched) {
        scheduleIdle()
        return
      }

      latched = true
      scheduleIdle()
      if (intent > 0) goNext({ reduced: reducedRef.current })
      else goPrev({ reduced: reducedRef.current })
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      window.removeEventListener('wheel', onWheel)
      unsub()
      clearIdle()
    }
  }, [isMobile])

  // Lock document scroll while cinematic owns the viewport.
  useEffect(() => {
    if (isMobile) return undefined
    const root = document.documentElement
    const body = document.body
    if (!unlocked) {
      root.style.overflow = 'hidden'
      body.style.overflow = 'hidden'
      return () => {
        root.style.overflow = ''
        body.style.overflow = ''
      }
    }
    root.style.overflow = 'auto'
    body.style.overflow = 'auto'
    return undefined
  }, [unlocked, isMobile])

  return null
}

export default GestureController
