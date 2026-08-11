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
    let sawWheelDuringAnim = false
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
        // Settled: briefly absorb residual coast from the gesture that
        // drove this transition. Use a hard idle window (not refreshed by
        // every latched wheel) so a deliberate follow-up swipe can land.
        if (sawWheelDuringAnim) {
          latched = true
          scheduleIdle()
        }
        sawWheelDuringAnim = false
      }
      wasAnimating = animating
    })

    const onWheel = (e) => {
      const intent = readVerticalIntent(e)
      if (intent === 0) return

      // Synchronous store read — not React-mirrored refs (one commit late).
      const { animating, unlocked: isUnlocked } = getNavigatorSnapshot()

      // Tail unlocked: allow native scroll, except at the very top where
      // upward intent re-enters the cinematic navigator.
      if (isUnlocked) {
        if (intent < 0 && window.scrollY <= 4) {
          e.preventDefault()
          if (latched || animating) {
            if (animating) sawWheelDuringAnim = true
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

      // During a timeline: swallow momentum. Mark that coast occurred so
      // settle can arm a short hard latch — do not refresh that latch on
      // every event (refreshing starved the next deliberate §02 swipe).
      if (animating) {
        sawWheelDuringAnim = true
        return
      }

      if (latched) {
        // Hard window: do not scheduleIdle() again. Extending idle here
        // meant each retry swipe kept the latch alive indefinitely.
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
