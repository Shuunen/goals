import { act, fireEvent, render, screen } from '@testing-library/react'
import { Toast } from './toast'

const base = { id: 1, message: 'Removed “a”' }

describe('Toast', () => {
  it('Toast A is an always mounted polite status area, empty without toast', () => {
    render(<Toast onDismiss={vi.fn<() => void>()} toast={undefined} />)
    const area = screen.getByRole('status')
    expect(area).toHaveAttribute('aria-live', 'polite')
    expect(area).toBeEmptyDOMElement()
  })

  it('Toast B shows the message & the action runs then dismisses', () => {
    const onAction = vi.fn<() => void>()
    const onDismiss = vi.fn<() => void>()
    render(<Toast onDismiss={onDismiss} toast={{ ...base, actionLabel: 'Undo', onAction }} />)
    expect(screen.getByText('Removed “a”')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    expect(onAction).toHaveBeenCalledOnce()
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('Toast C action click without handler still dismisses', () => {
    const onDismiss = vi.fn<() => void>()
    render(<Toast onDismiss={onDismiss} toast={{ ...base, actionLabel: 'Ok' }} />)
    fireEvent.click(screen.getByRole('button', { name: 'Ok' }))
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('Toast D has no button without action', () => {
    render(<Toast onDismiss={vi.fn<() => void>()} toast={base} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('Toast E dismisses itself after 5s & tells it expired', () => {
    vi.useFakeTimers()
    const onDismiss = vi.fn<() => void>()
    const onExpire = vi.fn<() => void>()
    render(<Toast onDismiss={onDismiss} toast={{ ...base, onExpire }} />)
    act(() => {
      vi.advanceTimersByTime(4999)
    })
    expect(onDismiss).not.toHaveBeenCalled()
    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(onDismiss).toHaveBeenCalledOnce()
    expect(onExpire).toHaveBeenCalledOnce()
    vi.useRealTimers()
  })

  it('Toast F expiring without handler dismisses, with a custom duration', () => {
    vi.useFakeTimers()
    const onDismiss = vi.fn<() => void>()
    render(<Toast onDismiss={onDismiss} toast={{ ...base, duration: 1000 }} />)
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(onDismiss).toHaveBeenCalledOnce()
    vi.useRealTimers()
  })

  it('Toast G pauses on hover and on focus', () => {
    vi.useFakeTimers()
    const onDismiss = vi.fn<() => void>()
    render(<Toast onDismiss={onDismiss} toast={{ ...base, actionLabel: 'Undo' }} />)
    const action = screen.getByRole('button', { name: 'Undo' })
    fireEvent.pointerEnter(action)
    act(() => {
      vi.advanceTimersByTime(20_000)
    })
    expect(onDismiss).not.toHaveBeenCalled()
    fireEvent.pointerLeave(action)
    fireEvent.focus(screen.getByRole('button', { name: 'Undo' }))
    act(() => {
      vi.advanceTimersByTime(20_000)
    })
    expect(onDismiss).not.toHaveBeenCalled()
    fireEvent.blur(screen.getByRole('button', { name: 'Undo' }))
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(onDismiss).toHaveBeenCalledOnce()
    vi.useRealTimers()
  })
})
