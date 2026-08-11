import { useEffect, useId, useState } from 'react'

/**
 * Registry so only the frontmost stuck cinematic stage captures wheel input
 * when tracks overlap (e.g. §04/§05 push).
 */
const stages = new Map()
const subscribers = new Set()

function republish() {
  let bestId = null
  let bestZ = -Infinity
  for (const [id, meta] of stages) {
    if (!meta.stuck || !meta.enabled) continue
    if (meta.zIndex >= bestZ) {
      bestZ = meta.zIndex
      bestId = id
    }
  }
  for (const [id, meta] of stages) {
    const next = id === bestId
    if (meta.active !== next) {
      meta.active = next
      meta.notify(next)
    }
  }
  subscribers.forEach((fn) => fn())
}

function upsert(id, partial) {
  const prev = stages.get(id) || {
    stuck: false,
    enabled: false,
    zIndex: 0,
    active: false,
    notify: () => {},
  }
  stages.set(id, { ...prev, ...partial })
  republish()
}

/**
 * True while this track is the frontmost stuck cinematic stage.
 */
export function useStageActive(trackRef, { enabled = true, zIndex = 0 } = {}) {
  const id = useId()
  const [active, setActive] = useState(false)

  useEffect(() => {
    upsert(id, {
      enabled,
      zIndex,
      notify: setActive,
    })
    return () => {
      stages.delete(id)
      republish()
    }
  }, [id, enabled, zIndex])

  useEffect(() => {
    if (!enabled) {
      upsert(id, { stuck: false, enabled: false })
      return undefined
    }

    const update = () => {
      const el = trackRef.current
      if (!el) {
        upsert(id, { stuck: false })
        return
      }
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      const stuck = rect.top <= 2 && rect.bottom >= vh - 2
      upsert(id, { stuck, enabled: true, zIndex })
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [trackRef, enabled, zIndex, id])

  return active
}
