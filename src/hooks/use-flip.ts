import { useCallback, useLayoutEffect, useRef } from 'react'

const duration = 220

// slides elements from their previous position to their new one whenever the layout changes (FLIP)
export function useFlip() {
  const elements = useRef(new Map<string, HTMLElement>())
  const tops = useRef(new Map<string, number>())

  const register = useCallback(
    (key: string) => (element: HTMLElement | null) => {
      if (element === null) elements.current.delete(key)
      else elements.current.set(key, element)
    },
    [],
  )

  useLayoutEffect(() => {
    const next = new Map<string, number>()
    for (const [key, element] of elements.current) {
      const { top } = element.getBoundingClientRect()
      const previous = tops.current.get(key)
      if (previous !== undefined && previous !== top) element.animate([{ transform: `translateY(${previous - top}px)` }, { transform: 'translateY(0)' }], { duration, easing: 'ease-out' })
      next.set(key, top)
    }
    tops.current = next
  })

  return register
}
