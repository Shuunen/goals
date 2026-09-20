import { act, renderHook } from '@testing-library/react'
import { useGoals } from './use-goals'

describe('useGoals', () => {
  it('useGoals A exposes default title & items when hash is empty', () => {
    document.location.hash = ''
    const { result } = renderHook(() => useGoals())
    expect(result.current.title).toBe('Goals')
    expect(result.current.items).toHaveLength(3)
  })

  it('useGoals B reads title & items from the location hash', () => {
    document.location.hash = '#My%20great%20goals=have%20fun,!avoid%20shitty%20job'
    const { result } = renderHook(() => useGoals())
    expect(result.current.title).toBe('My great goals')
    expect(result.current.items).toMatchInlineSnapshot(`
      [
        {
          "isDone": false,
          "title": "have fun",
        },
        {
          "isDone": true,
          "title": "avoid shitty job",
        },
      ]
    `)
  })

  it('useGoals C toggleItem flips the item done state and updates the hash', () => {
    document.location.hash = '#My%20great%20goals=have%20fun,!avoid%20shitty%20job'
    const { result } = renderHook(() => useGoals())
    act(() => {
      result.current.toggleItem(0)
    })
    expect(result.current.items[0]?.isDone).toBe(true)
    expect(document.location.hash).toBe('#My%20great%20goals=!have%20fun,!avoid%20shitty%20job')
  })

  it('useGoals D toggleItem flips a done item back to undone', () => {
    document.location.hash = '#My%20great%20goals=have%20fun,!avoid%20shitty%20job'
    const { result } = renderHook(() => useGoals())
    act(() => {
      result.current.toggleItem(1)
    })
    expect(result.current.items[1]?.isDone).toBe(false)
    expect(document.location.hash).toBe('#My%20great%20goals=have%20fun,avoid%20shitty%20job')
  })
})
