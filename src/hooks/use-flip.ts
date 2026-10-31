import { useCallback, useLayoutEffect, useRef } from 'react'

const duration = 220
// below this, a difference is rounding noise rather than a move
const minShift = 0.5

// the position the element has in the layout, without a transform in progress (like the entrance of the rows at load)
function layoutTop(element: HTMLElement) {
  const { transform } = globalThis.getComputedStyle(element)
  const shift = transform === 'none' ? 0 : new globalThis.DOMMatrixReadOnly(transform).m42
  return element.getBoundingClientRect().top - shift
}

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
      const top = layoutTop(element)
      const previous = tops.current.get(key)
      if (previous !== undefined && Math.abs(previous - top) > minShift) element.animate([{ transform: `translateY(${previous - top}px)` }, { transform: 'translateY(0)' }], { duration, easing: 'ease-out' })
      next.set(key, top)
    }
    tops.current = next
  })

  return register
}
