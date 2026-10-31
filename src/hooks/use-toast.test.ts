import { act, renderHook } from '@testing-library/react'
import { useToast } from './use-toast'

describe('useToast', () => {
  it('useToast A starts empty, shows a toast and dismisses it', () => {
    const { result } = renderHook(() => useToast())
    expect(result.current.toast).toBeUndefined()
    act(() => {
      result.current.showToast({ message: 'one' })
    })
    expect(result.current.toast?.message).toBe('one')
    act(() => {
      result.current.dismissToast()
    })
    expect(result.current.toast).toBeUndefined()
  })

  it('useToast B a newer toast replaces the visible one with a new id', () => {
    const { result } = renderHook(() => useToast())
    act(() => {
      result.current.showToast({ message: 'one' })
    })
    const first = result.current.toast?.id
    act(() => {
      result.current.showToast({ message: 'two' })
    })
    expect(result.current.toast?.message).toBe('two')
    expect(result.current.toast?.id).not.toBe(first)
  })
})
