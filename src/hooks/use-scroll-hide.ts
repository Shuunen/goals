import { useEffect, useState } from 'react'

const edgeDistance = 40
const idleDelay = 1500

// true while the page is being scrolled down : the floating buttons step aside, and come back on scroll up,
// near the top or the bottom, or after a pause. A page that does not scroll never fires, so nothing changes there.
export function useScrollHide() {
  const [isHidden, setIsHidden] = useState(false)
  useEffect(() => {
    let last = globalThis.scrollY
    let frame = 0
    let timer: ReturnType<typeof setTimeout> | undefined = undefined
    const onFrame = () => {
      const position = globalThis.scrollY
      const isGoingDown = position > last
      last = position
      const isAtEdge = position <= edgeDistance || position >= document.documentElement.scrollHeight - globalThis.innerHeight - edgeDistance
      setIsHidden(isGoingDown && !isAtEdge)
      clearTimeout(timer)
      timer = setTimeout(() => setIsHidden(false), idleDelay)
    }
    const onScroll = () => {
      globalThis.cancelAnimationFrame(frame)
      frame = globalThis.requestAnimationFrame(onFrame)
    }
    globalThis.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      globalThis.removeEventListener('scroll', onScroll)
      globalThis.cancelAnimationFrame(frame)
      clearTimeout(timer)
    }
  }, [])
  return isHidden
}
