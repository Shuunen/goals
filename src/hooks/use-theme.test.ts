import { act, renderHook, waitFor } from '@testing-library/react'
import { themes, useTheme } from './use-theme'

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
    localStorage.setItem('goals-theme', 'dracula')
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('dracula')
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
    localStorage.setItem('goals-theme', 'dracula')
    document.location.hash = '#t=a,!b'
    renderHook(() => useTheme())
    expect(document.location.hash).toBe('#t=a,!b&theme=dracula')
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

  it('useTheme H follows a hash changed from outside, ignoring unknown themes', async () => {
    localStorage.clear()
    document.location.hash = '#t=a'
    const { result } = renderHook(() => useTheme())
    act(() => {
      document.location.hash = '#t=a&theme=nope'
    })
    await waitFor(() => {
      expect(document.location.hash).toBe('#t=a&theme=nope')
    })
    expect(result.current.theme).toBe('paper')
    act(() => {
      document.location.hash = '#t=a&theme=dracula'
    })
    await waitFor(() => {
      expect(result.current.theme).toBe('dracula')
    })
  })

  it('useTheme J until a theme is chosen the page follows the system, and the url stays clean', () => {
    let isDark = false
    const listeners: (() => void)[] = []
    vi.stubGlobal('matchMedia', () => ({
      addEventListener: (_type: string, listener: () => void) => {
        listeners.push(listener)
      },
      get matches() {
        return isDark
      },
      removeEventListener: vi.fn<() => void>(),
    }))
    localStorage.clear()
    document.location.hash = '#t=a'
    const { result, unmount } = renderHook(() => useTheme())
    expect(document.documentElement.dataset.theme).toBe('paper')
    isDark = true
    act(() => {
      for (const listener of listeners) listener()
    })
    expect(document.documentElement.dataset.theme).toBe('dracula')
    expect(result.current.theme).toBe('dracula')
    expect(document.location.hash).toBe('#t=a')
    unmount()
    vi.unstubAllGlobals()
  })

  it('useTheme K a chosen theme wins over the system, paper included, and goes in the url', () => {
    vi.stubGlobal('matchMedia', () => ({ addEventListener: vi.fn<() => void>(), matches: true, removeEventListener: vi.fn<() => void>() }))
    localStorage.clear()
    document.location.hash = '#t=a'
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('dracula')
    act(() => {
      result.current.changeTheme('paper')
    })
    expect(result.current.theme).toBe('paper')
    expect(document.documentElement.dataset.theme).toBe('paper')
    expect(document.location.hash).toBe('#t=a&theme=paper')
    vi.unstubAllGlobals()
  })

  it('useTheme L the old dark name still works, in a link and in the browser memory', () => {
    localStorage.setItem('goals-theme', 'dark')
    document.location.hash = '#t=a'
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('dracula')
    expect(document.location.hash).toBe('#t=a&theme=dracula')
    document.location.hash = '#t=a&theme=dark'
    const link = renderHook(() => useTheme())
    expect(link.result.current.theme).toBe('dracula')
  })

  it('useTheme M paper is the first theme, there is no auto one', () => {
    expect(themes[0]).toBe('paper')
    expect(themes).not.toContain('auto')
  })

  it('useTheme N the PWA bars follow the theme the system gave', () => {
    document.head.insertAdjacentHTML('beforeend', '<meta name="theme-color" content="#0a5" />')
    localStorage.clear()
    document.location.hash = '#t=a'
    document.documentElement.style.setProperty('--bg', '#282a36')
    renderHook(() => useTheme())
    expect(document.querySelector('meta[name="theme-color"]')?.getAttribute('content')).toBe('#282a36')
  })
})
