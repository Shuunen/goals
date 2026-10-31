import { useLayoutEffect, useRef, type RefObject } from 'react'

const duration = 250

// when the goals change places, each one slides from where it was to where it is now (FLIP), instead of teleporting
// positions are read after every render so they never go stale, but only a changed order animates
export function useFlip(list: RefObject<HTMLElement | null>, order: string, isEnabled: boolean) {
  const previous = useRef({ order, tops: new WeakMap<HTMLElement, number>() })
  useLayoutEffect(() => {
    const tops = new WeakMap<HTMLElement, number>()
    // the ref is always set once the layout is done
    // v8 ignore next -- @preserve
    const goals = [...(list.current?.querySelectorAll<HTMLElement>('[data-flip]') ?? [])]
    for (const goal of goals) tops.set(goal, goal.offsetTop)
    const canMove = isEnabled && previous.current.order !== order && !globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (canMove)
      for (const goal of goals) {
        const before = previous.current.tops.get(goal)
        const distance = before === undefined ? 0 : before - goal.offsetTop
        if (distance !== 0) goal.animate([{ transform: `translateY(${distance}px)` }, { transform: 'translateY(0)' }], { duration, easing: 'ease-out' })
      }
    previous.current = { order, tops }
  })
}
