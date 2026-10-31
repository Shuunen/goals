import { act, renderHook } from '@testing-library/react'
import { createItem } from '../models/item.model'
import { useUndoableGoals } from './use-undoable-goals'

describe('useUndoableGoals', () => {
  it('useUndoableGoals A removing a missing goal changes nothing and says nothing', () => {
    document.location.hash = '#t=a'
    const { result } = renderHook(() => useUndoableGoals())
    act(() => {
      result.current.removeItem(5)
    })
    expect(result.current.items).toHaveLength(1)
    expect(result.current.toast).toBeUndefined()
  })

  it('useUndoableGoals C the toast says goal for one, goals for several', () => {
    document.location.hash = '#t=a'
    const { result } = renderHook(() => useUndoableGoals())
    act(() => {
      result.current.replaceList([createItem('x')])
    })
    expect(result.current.toast?.message).toBe('List replaced by 1 goal')
    act(() => {
      result.current.addItems([createItem('y')])
    })
    expect(result.current.toast?.message).toBe('Added 1 goal')
  })

  it('useUndoableGoals D a plain edit ends the Undo offer, so Undo can never wipe it', () => {
    document.location.hash = '#t=a,b'
    const { result } = renderHook(() => useUndoableGoals())
    act(() => {
      result.current.removeItem(0)
    })
    expect(result.current.toast?.actionLabel).toBe('Undo')
    act(() => {
      result.current.toggleItem(0)
    })
    expect(result.current.toast).toBeUndefined()
    expect(result.current.items.map(item => item.isDone)).toStrictEqual([true])
    act(() => {
      result.current.undo()
    })
    expect(result.current.items).toHaveLength(1)
  })

  it('useUndoableGoals E a plain edit leaves a toast that is not an Undo offer alone', () => {
    document.location.hash = '#t=a'
    const { result } = renderHook(() => useUndoableGoals())
    act(() => {
      result.current.showToast({ message: 'New version available' })
    })
    act(() => {
      result.current.renameItem(0, 'b')
    })
    expect(result.current.toast?.message).toBe('New version available')
  })

  it('useUndoableGoals B clearing done goals when none are done changes nothing and says nothing', () => {
    document.location.hash = '#t=a'
    const { result } = renderHook(() => useUndoableGoals())
    act(() => {
      result.current.clearDone()
    })
    expect(result.current.toast).toBeUndefined()
  })
})
