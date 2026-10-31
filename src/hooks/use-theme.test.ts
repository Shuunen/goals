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

  it('useTheme H colors the PWA bars like the theme background', () => {
    document.head.insertAdjacentHTML('beforeend', '<meta name="theme-color" content="#0a5" />')
    document.documentElement.style.setProperty('--bg', ' #123456 ')
    renderHook(() => useTheme())
    expect(document.querySelector('meta[name="theme-color"]')?.getAttribute('content')).toBe('#123456')
  })

  it('useTheme I leaves the PWA bars alone without a theme background or a meta tag', () => {
    document.querySelector('meta[name="theme-color"]')?.remove()
    document.documentElement.style.removeProperty('--bg')
    expect(() => renderHook(() => useTheme())).not.toThrow()
  })
})
