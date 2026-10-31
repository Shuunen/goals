import { act, renderHook, waitFor } from '@testing-library/react'
import { hashToData } from '../utils/hash.utils'
import { useGoals } from './use-goals'

describe('useGoals', () => {
  it('useGoals restores the saved goals when the hash is empty, like a PWA relaunch', () => {
    localStorage.clear()
    document.location.hash = '#My%20great%20goals=have%20fun'
    const first = renderHook(() => useGoals())
    act(() => {
      first.result.current.addItem('buy milk')
    })
    first.unmount()
    document.location.hash = ''
    const { result } = renderHook(() => useGoals())
    expect(result.current.title).toBe('My great goals')
    expect(result.current.items.map(item => item.title)).toStrictEqual(['have fun', 'buy milk'])
  })

  it('useGoals prefers the hash over the saved goals', () => {
    localStorage.setItem('goals-saved', '#Old=stale')
    document.location.hash = '#New=fresh'
    const { result } = renderHook(() => useGoals())
    expect(result.current.title).toBe('New')
  })

  it('useGoals A exposes default title & items when hash is empty', () => {
    document.location.hash = ''
    localStorage.clear()
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

  it('useGoals C toggleItem checks a goal, which sinks to the end, and updates the hash', () => {
    document.location.hash = '#My%20great%20goals=have%20fun,!avoid%20shitty%20job'
    const { result } = renderHook(() => useGoals())
    act(() => {
      result.current.toggleItem(0)
    })
    expect(result.current.items[0]?.isDone).toBe(true)
    expect(document.location.hash).toBe('#My%20great%20goals=!avoid%20shitty%20job,!have%20fun')
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
    expect(result.current.title).toBe('New, title')
    expect(document.location.hash).toBe('#New%2C%20title=have%20fun')
  })

  it('useGoals E2 keeps accents & punctuation of an added item', () => {
    document.location.hash = '#t=a'
    const { result } = renderHook(() => useGoals())
    act(() => {
      result.current.addItem("café l'été ?")
    })
    expect(result.current.items[1]?.title).toBe("café l'été ?")
    expect(hashToData(document.location.hash).items[1]?.title).toBe("café l'été ?")
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
    expect(document.location.hash).toBe('#t=b,!a&theme=dark&font=lora')
  })

  it('useGoals L first visit shows the default goals', () => {
    localStorage.clear()
    document.location.hash = ''
    const { result } = renderHook(() => useGoals())
    expect(result.current.title).toBe('Goals')
    expect(result.current.items).toHaveLength(3)
  })

  it('useGoals M a stored empty list is not replaced by the defaults', () => {
    localStorage.setItem('goals-saved', '#Mine=')
    document.location.hash = ''
    const { result } = renderHook(() => useGoals())
    expect(result.current.title).toBe('Mine')
    expect(result.current.items).toStrictEqual([])
  })

  it('useGoals N a shared empty list stays empty and keeps its title', () => {
    localStorage.clear()
    document.location.hash = '#Mine='
    const { result } = renderHook(() => useGoals())
    expect(result.current.title).toBe('Mine')
    expect(result.current.items).toStrictEqual([])
  })

  it('useGoals O removing the last goal keeps the title in the hash & the storage', () => {
    localStorage.clear()
    document.location.hash = '#Mine=a'
    const { result } = renderHook(() => useGoals())
    act(() => {
      result.current.removeItem(0)
    })
    expect(document.location.hash).toBe('#Mine=')
    expect(localStorage.getItem('goals-saved')).toBe('#Mine=')
  })

  it('useGoals P opening a shared link without editing leaves the storage untouched', () => {
    localStorage.setItem('goals-saved', '#Mine=mine')
    document.location.hash = '#Shared=theirs'
    renderHook(() => useGoals())
    expect(localStorage.getItem('goals-saved')).toBe('#Mine=mine')
  })

  it('useGoals Q changes replace the history entry instead of adding one', () => {
    document.location.hash = '#t=a,b,c'
    const { result } = renderHook(() => useGoals())
    const before = globalThis.history.length
    act(() => {
      result.current.toggleItem(0)
      result.current.toggleItem(1)
      result.current.toggleItem(2)
    })
    expect(globalThis.history).toHaveLength(before)
  })

  it('useGoals R a hash changed from outside updates the goals, without saving them', async () => {
    localStorage.setItem('goals-saved', '#Mine=mine')
    document.location.hash = '#t=a'
    const { result } = renderHook(() => useGoals())
    act(() => {
      document.location.hash = '#Other=x,!y'
    })
    await waitFor(() => {
      expect(result.current.title).toBe('Other')
    })
    expect(result.current.items.map(item => [item.title, item.isDone])).toStrictEqual([
      ['x', false],
      ['y', true],
    ])
    expect(localStorage.getItem('goals-saved')).toBe('#Mine=mine')
  })

  it('useGoals S a shared link without title gets the default one', () => {
    localStorage.clear()
    document.location.hash = '#a,b'
    const { result } = renderHook(() => useGoals())
    expect(result.current.title).toBe('Goals')
    expect(result.current.items).toHaveLength(2)
  })

  it('useGoals T a hash without goals or with the same goals changes nothing', async () => {
    document.location.hash = '#t=a'
    const { result } = renderHook(() => useGoals())
    const before = result.current.items
    act(() => {
      document.location.hash = '#&theme=dark'
    })
    await waitFor(() => {
      expect(document.location.hash).toBe('#&theme=dark')
    })
    act(() => {
      document.location.hash = '#t=a&theme=rose'
    })
    await waitFor(() => {
      expect(document.location.hash).toBe('#t=a&theme=rose')
    })
    expect(result.current.items).toBe(before)
  })

  it('useGoals U undo gives back the list as it was before the last remembered action', () => {
    document.location.hash = '#t=a,!b,c'
    const { result } = renderHook(() => useGoals())
    act(() => {
      result.current.remember()
      result.current.removeItem(1)
    })
    expect(result.current.items.map(item => item.title)).toStrictEqual(['a', 'c'])
    act(() => {
      result.current.undo()
    })
    expect(result.current.items.map(item => [item.title, item.isDone])).toStrictEqual([
      ['a', false],
      ['b', true],
      ['c', false],
    ])
    expect(document.location.hash).toBe('#t=a,!b,c')
    expect(localStorage.getItem('goals-saved')).toBe('#t=a,!b,c')
  })

  it('useGoals V undo does nothing without a remembered list', () => {
    document.location.hash = '#t=a'
    const { result } = renderHook(() => useGoals())
    act(() => {
      result.current.undo()
    })
    expect(result.current.items).toHaveLength(1)
  })

  it('useGoals W undo goes back one action at a time, keeping the last 10', () => {
    document.location.hash = '#t=a'
    const { result } = renderHook(() => useGoals())
    for (let index = 0; index < 12; index += 1)
      act(() => {
        result.current.remember()
        result.current.addItem(`n${index}`)
      })
    expect(result.current.items).toHaveLength(13)
    for (let index = 0; index < 12; index += 1)
      act(() => {
        result.current.undo()
      })
    expect(result.current.items).toHaveLength(3)
  })

  it('useGoals X forget drops what can be undone', () => {
    document.location.hash = '#t=a,b'
    const { result } = renderHook(() => useGoals())
    act(() => {
      result.current.forget()
      result.current.remember()
      result.current.removeItem(0)
      result.current.forget()
    })
    act(() => {
      result.current.undo()
    })
    expect(result.current.items).toHaveLength(1)
  })

  it('useGoals Y unchecking a goal moves it to the boundary, before the first done goal', () => {
    document.location.hash = '#t=a,b,!c,!d,e'
    const { result } = renderHook(() => useGoals())
    act(() => {
      result.current.toggleItem(3)
    })
    expect(result.current.items.map(item => [item.title, item.isDone])).toStrictEqual([
      ['a', false],
      ['b', false],
      ['d', false],
      ['c', true],
      ['e', false],
    ])
  })

  it('useGoals Z checking the last open goal & toggling a missing one', () => {
    document.location.hash = '#t=a,!b'
    const { result } = renderHook(() => useGoals())
    act(() => {
      result.current.toggleItem(0)
      result.current.toggleItem(9)
    })
    expect(result.current.items.map(item => item.title)).toStrictEqual(['b', 'a'])
  })

  it('useGoals resetAll unchecks every goal and keeps the order', () => {
    document.location.hash = '#t=a,!b,c,!d'
    const { result } = renderHook(() => useGoals())
    act(() => {
      result.current.resetAll()
    })
    expect(result.current.items.map(item => [item.title, item.isDone])).toStrictEqual([
      ['a', false],
      ['b', false],
      ['c', false],
      ['d', false],
    ])
  })
})
