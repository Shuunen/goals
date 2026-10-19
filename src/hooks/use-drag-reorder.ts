import { useCallback, useEffect, useState, type PointerEvent } from 'react'

const half = 0.5

// pointer events rather than native drag & drop, so it behaves the same with a mouse, a pen or a finger
export function useDragReorder(onMove: (from: number, to: number) => void, itemsCount: number) {
  const [grabbed, setGrabbed] = useState<number>()

  // listened on the window since the row (and its handle) moves around the DOM while being dragged
  useEffect(() => {
    if (grabbed === undefined) return undefined
    const release = () => setGrabbed(undefined)
    globalThis.addEventListener('pointerup', release)
    globalThis.addEventListener('pointercancel', release)
    return () => {
      globalThis.removeEventListener('pointerup', release)
      globalThis.removeEventListener('pointercancel', release)
    }
  }, [grabbed])

  // meant to be listened on the list, the pointer moves bubble up to it
  const drag = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (grabbed === undefined) return
      const list = event.currentTarget
      // layout offsets ignore the slide animations, so rows being animated can't confuse the hit test
      const pointer = event.clientY - list.getBoundingClientRect().top
      const hovered = [...list.children].slice(0, itemsCount).findIndex(row => pointer < (row as HTMLElement).offsetTop - list.offsetTop + (row as HTMLElement).offsetHeight * half)
      const target = hovered === -1 ? itemsCount - 1 : hovered
      if (target === grabbed) return
      onMove(grabbed, target)
      setGrabbed(target)
    },
    [grabbed, itemsCount, onMove],
  )

  return { drag, grab: setGrabbed, grabbed }
}
