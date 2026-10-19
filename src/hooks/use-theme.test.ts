import { act, renderHook } from '@testing-library/react'
import { useTheme } from './use-theme'

describe('useTheme', () => {
  it('useTheme A defaults to paper', () => {
    localStorage.clear()
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('paper')
    expect(document.documentElement.dataset.theme).toBe('paper')
  })

  it('useTheme B ignores an unknown stored theme', () => {
    localStorage.setItem('goals-theme', 'nope')
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('paper')
  })

  it('useTheme C restores the stored theme', () => {
    localStorage.setItem('goals-theme', 'dark')
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('dark')
  })

  it('useTheme D changeTheme applies and persists the theme', () => {
    const { result } = renderHook(() => useTheme())
    act(() => {
      result.current.changeTheme('ocean')
    })
    expect(document.documentElement.dataset.theme).toBe('ocean')
    expect(localStorage.getItem('goals-theme')).toBe('ocean')
  })

  it('useTheme E a shared link wins over the stored theme', () => {
    localStorage.setItem('goals-theme', 'dark')
    document.location.hash = '#t=a&theme=rose'
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('rose')
  })

  it('useTheme F puts a remembered theme in the url, keeping the goals', () => {
    localStorage.setItem('goals-theme', 'dark')
    document.location.hash = '#t=a,!b'
    renderHook(() => useTheme())
    expect(document.location.hash).toBe('#t=a,!b&theme=dark')
  })

  it('useTheme G leaves the url clean for the default theme, then follows the changes', () => {
    localStorage.clear()
    document.location.hash = '#t=a'
    const { result } = renderHook(() => useTheme())
    expect(document.location.hash).toBe('#t=a')
    act(() => {
      result.current.changeTheme('ocean')
    })
    expect(document.location.hash).toBe('#t=a&theme=ocean')
    act(() => {
      result.current.changeTheme('paper')
    })
    expect(document.location.hash).toBe('#t=a&theme=paper')
  })
})
