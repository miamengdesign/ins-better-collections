import { useEffect, useRef } from 'react'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { GESTURE_IDLE_MS, readVerticalIntent } from './gesture'
import { goNext, goPrev } from './navigatorStore'
import { useNavigator } from './useNavigator'

/**
 * Single page-level wheel authority for the cinematic experience.
 * Sections do not attach their own wheel listeners.
 */
function GestureController() {
  const isMobile = useMediaQuery('(max-width: 767px)')
  const reduced = useReducedMotion()
  const { unlocked, animating } = useNavigator()
  const latchedRef = useRef(false)
  const idleTimerRef = useRef(0)
  const unlockedRef = useRef(unlocked)
  const animatingRef = useRef(animating)
  unlockedRef.current = unlocked
  animatingRef.current = animating

  useEffect(() => {
    if (isMobile) return undefined

    const clearIdle = () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current)
        idleTimerRef.current = 0
      }
    }

    const scheduleIdle = () => {
      clearIdle()
      idleTimerRef.current = window.setTimeout(() => {
        idleTimerRef.current = 0
        latchedRef.current = false
      }, GESTURE_IDLE_MS)
    }

    const onWheel = (e) => {
      const intent = readVerticalIntent(e)
      if (intent === 0) return

      // Tail unlocked: allow native scroll, except at the very top where
      // upward intent re-enters the cinematic navigator.
      if (unlockedRef.current) {
        if (intent < 0 && window.scrollY <= 4) {
          e.preventDefault()
          if (latchedRef.current || animatingRef.current) {
            scheduleIdle()
            return
          }
          latchedRef.current = true
          scheduleIdle()
          goPrev({ reduced })
          return
        }
        // Native scroll for the static tail.
        latchedRef.current = false
        return
      }

      // Cinematic lock: always take vertical intent.
      e.preventDefault()

      if (latchedRef.current || animatingRef.current) {
        scheduleIdle()
        return
      }

      latchedRef.current = true
      scheduleIdle()
      if (intent > 0) goNext({ reduced })
      else goPrev({ reduced })
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      window.removeEventListener('wheel', onWheel)
      clearIdle()
    }
  }, [isMobile, reduced])

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
