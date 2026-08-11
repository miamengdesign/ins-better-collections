import { useSyncExternalStore } from 'react'

function subscribe(query, callback) {
  const mql = window.matchMedia(query)
  mql.addEventListener('change', callback)
  return () => mql.removeEventListener('change', callback)
}

/**
 * Subscribe to a CSS media query. Returns whether it currently matches.
 * `defaultValue` is used for SSR / first paint before the store hydrates.
 */
export function useMediaQuery(query, defaultValue = false) {
  return useSyncExternalStore(
    (callback) => subscribe(query, callback),
    () => window.matchMedia(query).matches,
    () => defaultValue,
  )
}
