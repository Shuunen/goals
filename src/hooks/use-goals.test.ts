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

  it('useGoals E renames the title, ignoring empty values', () => {
    document.location.hash = '#My%20great%20goals=have%20fun'
    const { result } = renderHook(() => useGoals())
    act(() => {
      result.current.renameTitle('   ')
      result.current.renameTitle('New, title')
    })
    expect(result.current.title).toBe('New title')
    expect(document.location.hash).toBe('#New%20title=have%20fun')
  })

  it('useGoals F renames an item, ignoring empty values', () => {
    document.location.hash = '#t=have%20fun,other'
    const { result } = renderHook(() => useGoals())
    act(() => {
      result.current.renameItem(0, '')
      result.current.renameItem(0, 'have more fun')
    })
    expect(result.current.items.map(item => item.title)).toStrictEqual(['have more fun', 'other'])
  })

  it('useGoals G adds an item, ignoring empty values', () => {
    document.location.hash = '#t=have%20fun'
    const { result } = renderHook(() => useGoals())
    act(() => {
      result.current.addItem('  ')
      result.current.addItem('read')
    })
    expect(document.location.hash).toBe('#t=have%20fun,read')
  })

  it('useGoals H removes an item', () => {
    document.location.hash = '#t=a,b,c'
    const { result } = renderHook(() => useGoals())
    act(() => {
      result.current.removeItem(1)
    })
    expect(document.location.hash).toBe('#t=a,c')
  })

  it('useGoals I moves an item', () => {
    document.location.hash = '#t=a,b,c'
    const { result } = renderHook(() => useGoals())
    act(() => {
      result.current.moveItem(0, 2)
    })
    expect(document.location.hash).toBe('#t=b,c,a')
  })

  it('useGoals J ignores moves that are out of range or pointless', () => {
    document.location.hash = '#t=a,b,c'
    const { result } = renderHook(() => useGoals())
    act(() => {
      result.current.moveItem(1, 1)
      result.current.moveItem(-1, 1)
      result.current.moveItem(3, 1)
      result.current.moveItem(1, 3)
      result.current.moveItem(1, -1)
    })
    expect(result.current.items.map(item => item.title)).toStrictEqual(['a', 'b', 'c'])
  })

  it('useGoals K keeps the settings of the hash when goals change', () => {
    document.location.hash = '#t=a,b&theme=dark&font=lora'
    const { result } = renderHook(() => useGoals())
    act(() => {
      result.current.toggleItem(0)
    })
    expect(document.location.hash).toBe('#t=!a,b&theme=dark&font=lora')
  })
})
