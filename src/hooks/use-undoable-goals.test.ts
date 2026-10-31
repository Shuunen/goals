import { act, renderHook } from '@testing-library/react'
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

  it('useUndoableGoals B clearing done goals when none are done changes nothing and says nothing', () => {
    document.location.hash = '#t=a'
    const { result } = renderHook(() => useUndoableGoals())
    act(() => {
      result.current.clearDone()
    })
    expect(result.current.toast).toBeUndefined()
  })
})
