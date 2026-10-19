import { act, renderHook } from '@testing-library/react'
import { useFont } from './use-font'

describe('useFont', () => {
  it('useFont A defaults title and labels to the same, first font', () => {
    localStorage.clear()
    const { result } = renderHook(() => useFont())
    expect(result.current.titleFont).toBe('indie-flower')
    expect(result.current.labelFont).toBe('indie-flower')
    expect(document.documentElement.dataset.titleFont).toBe('indie-flower')
    expect(document.documentElement.dataset.labelFont).toBe('indie-flower')
  })

  it('useFont B the first pick sets the title, the second the labels', () => {
    localStorage.clear()
    const { result } = renderHook(() => useFont())
    act(() => {
      result.current.pickFont('lora')
    })
    expect(result.current.titleFont).toBe('lora')
    expect(result.current.labelFont).toBe('indie-flower')
    act(() => {
      result.current.pickFont('caveat')
    })
    expect(result.current.titleFont).toBe('lora')
    expect(result.current.labelFont).toBe('caveat')
  })

  it('useFont C picks keep alternating, and each one persists', () => {
    localStorage.clear()
    const { result } = renderHook(() => useFont())
    act(() => {
      result.current.pickFont('lora')
    })
    act(() => {
      result.current.pickFont('caveat')
    })
    act(() => {
      result.current.pickFont('jetbrains-mono')
    })
    expect(result.current.titleFont).toBe('jetbrains-mono')
    expect(result.current.labelFont).toBe('caveat')
    expect(localStorage.getItem('goals-titleFont')).toBe('jetbrains-mono')
    expect(localStorage.getItem('goals-labelFont')).toBe('caveat')
  })
})
