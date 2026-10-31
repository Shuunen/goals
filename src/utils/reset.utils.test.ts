import { clearEverything } from './reset.utils'

describe('clearEverything', () => {
  it('clearEverything A removes what the app remembers, leaves the rest, empties the url and reloads', () => {
    localStorage.setItem('goals-saved', '#t=a')
    localStorage.setItem('goals-theme', 'dark')
    localStorage.setItem('other-app', 'keep')
    document.location.hash = '#t=a&theme=dark&size=120'
    const reload = vi.spyOn(globalThis.location, 'reload').mockReturnValue(undefined)
    clearEverything()
    expect(localStorage.getItem('goals-saved')).toBeNull()
    expect(localStorage.getItem('goals-theme')).toBeNull()
    expect(localStorage.getItem('other-app')).toBe('keep')
    expect(document.location.hash).toBe('#Goals=')
    expect(reload).toHaveBeenCalledOnce()
    reload.mockRestore()
    localStorage.clear()
  })
})
