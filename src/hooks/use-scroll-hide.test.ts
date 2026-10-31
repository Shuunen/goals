import { act, renderHook } from '@testing-library/react'
import { useScrollHide } from './use-scroll-hide'

function scrollTo(position: number) {
  Object.defineProperty(globalThis, 'scrollY', { configurable: true, value: position })
  act(() => {
    globalThis.dispatchEvent(new Event('scroll'))
  })
}

function setup() {
  vi.useFakeTimers()
  vi.stubGlobal('requestAnimationFrame', (task: () => void) => setTimeout(task, 0))
  vi.stubGlobal('cancelAnimationFrame', (id: number) => clearTimeout(id))
  Object.defineProperty(globalThis, 'scrollY', { configurable: true, value: 0 })
  Object.defineProperty(globalThis, 'innerHeight', { configurable: true, value: 500 })
  Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: 2000 })
  return renderHook(() => useScrollHide())
}

async function frame() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(0)
  })
}

describe('useScrollHide', () => {
  it('useScrollHide A hides while scrolling down, shows on scroll up', async () => {
    const { result } = setup()
    expect(result.current).toBe(false)
    scrollTo(300)
    await frame()
    expect(result.current).toBe(true)
    scrollTo(250)
    await frame()
    expect(result.current).toBe(false)
    vi.useRealTimers()
  })

  it('useScrollHide B stays visible at the top and near the bottom', async () => {
    const { result } = setup()
    scrollTo(20)
    await frame()
    expect(result.current).toBe(false)
    scrollTo(1480)
    await frame()
    expect(result.current).toBe(false)
    vi.useRealTimers()
  })

  it('useScrollHide C comes back after a pause', async () => {
    const { result } = setup()
    scrollTo(300)
    await frame()
    expect(result.current).toBe(true)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1500)
    })
    expect(result.current).toBe(false)
    vi.useRealTimers()
  })

  it('useScrollHide D handles a burst of scroll events and unmounts cleanly', async () => {
    const { result, unmount } = setup()
    scrollTo(100)
    scrollTo(200)
    await frame()
    expect(result.current).toBe(true)
    unmount()
    vi.useRealTimers()
  })
})
