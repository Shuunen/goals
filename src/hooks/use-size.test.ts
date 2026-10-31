import { act, renderHook } from '@testing-library/react'
import { useSize } from './use-size'

describe('useSize', () => {
  it('useSize A defaults to 100% and applies the zoom', () => {
    localStorage.clear()
    document.location.hash = ''
    const { result } = renderHook(() => useSize())
    expect(result.current.size).toBe('100')
    expect(document.documentElement.style.getPropertyValue('--zoom')).toBe('1')
    expect(document.location.hash).toBe('')
  })

  it('useSize B steps up and down, persisting the choice', () => {
    localStorage.clear()
    const { result } = renderHook(() => useSize())
    act(() => {
      result.current.larger()
    })
    expect(result.current.size).toBe('125')
    expect(localStorage.getItem('goals-size')).toBe('125')
    act(() => {
      result.current.smaller()
    })
    expect(result.current.size).toBe('100')
  })

  it('useSize C stops at both ends', () => {
    document.location.hash = '#t=a'
    localStorage.setItem('goals-size', '175')
    const { result, unmount } = renderHook(() => useSize())
    expect(result.current.canGrow).toBe(false)
    act(() => {
      result.current.larger()
    })
    expect(result.current.size).toBe('175')
    unmount()
    document.location.hash = '#t=a'
    localStorage.setItem('goals-size', '75')
    const smallest = renderHook(() => useSize())
    expect(smallest.result.current.canShrink).toBe(false)
    act(() => {
      smallest.result.current.smaller()
    })
    expect(smallest.result.current.size).toBe('75')
    localStorage.clear()
  })
})
