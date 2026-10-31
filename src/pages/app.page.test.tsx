import { act, fireEvent, render, screen } from '@testing-library/react'
import { App } from './app.page'

function indexOf(element: HTMLElement) {
  return [...(element.parentElement?.children ?? [])].indexOf(element)
}

// happy-dom does not implement the layout, so rows are stacked 100px apart in the order of the dom
function mockLayout() {
  const rect = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function mock(this: HTMLElement) {
    return { top: indexOf(this) * 100 } as DOMRect
  })
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, value: 100 })
  Object.defineProperty(HTMLElement.prototype, 'offsetTop', {
    configurable: true,
    get(this: HTMLElement) {
      return indexOf(this) * 100
    },
  })
  return () => rect.mockRestore()
}

describe('App', () => {
  it('App A renders title & items from the hash', () => {
    document.location.hash = '#My%20goals=have%20fun,!avoid%20shitty%20job'
    render(<App />)
    expect(screen.getByText('My goals')).toBeInTheDocument()
    expect(screen.getByText('have fun')).toBeInTheDocument()
    expect(screen.getByText('avoid shitty job')).toBeInTheDocument()
  })

  it('App B toggles an item when clicked', () => {
    document.location.hash = '#My%20goals=have%20fun,!avoid%20shitty%20job'
    render(<App />)
    const checkbox = screen.getByText('have fun').closest('label')?.querySelector('input')
    expect(checkbox).not.toBeNull()
    if (checkbox) fireEvent.click(checkbox)
    expect(document.location.hash).toBe('#My%20goals=!have%20fun,!avoid%20shitty%20job')
  })

  it('App C edits title, renames, adds and removes goals', () => {
    document.location.hash = '#My%20goals=a,a,b'
    render(<App />)
    fireEvent.click(screen.getByTitle('Edit'))
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Mine' } })
    fireEvent.blur(screen.getByLabelText('Title'))
    fireEvent.change(screen.getByLabelText('Goal 3'), { target: { value: 'c' } })
    fireEvent.keyDown(screen.getByLabelText('Goal 3'), { key: 'a' })
    fireEvent.keyDown(screen.getByLabelText('Goal 3'), { key: 'Enter' })
    fireEvent.blur(screen.getByLabelText('Goal 3'))
    fireEvent.change(screen.getByLabelText('New goal'), { target: { value: 'd' } })
    fireEvent.blur(screen.getByLabelText('New goal'))
    fireEvent.click(screen.getAllByLabelText('Remove a')[0])
    fireEvent.click(screen.getByLabelText('Confirm removing a'))
    expect(document.location.hash).toBe('#Mine=a,c,d')
    fireEvent.click(screen.getByTitle('Edit'))
    expect(screen.queryByLabelText('Title')).toBeNull()
  })

  it('App D opens settings, changes theme and closes', () => {
    document.location.hash = '#My%20goals=a'
    render(<App />)
    fireEvent.click(screen.getByTitle('Settings'))
    expect(screen.getByText('Version')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('dialog'))
    fireEvent.click(screen.getByRole('radio', { name: 'dark' }))
    expect(document.documentElement.dataset.theme).toBe('dark')
    fireEvent.click(screen.getByLabelText('Close'))
    expect(screen.queryByRole('dialog')).toBeNull()
    // do not leak the choices to the other tests
    localStorage.clear()
  })

  it('App D1 zooms the whole app from the settings, within the limits', () => {
    localStorage.clear()
    document.location.hash = '#My%20goals=a'
    render(<App />)
    fireEvent.click(screen.getByTitle('Settings'))
    expect(screen.getByLabelText('Current size')).toHaveTextContent('100%')
    fireEvent.click(screen.getByLabelText('Larger'))
    expect(screen.getByLabelText('Current size')).toHaveTextContent('125%')
    expect(document.documentElement.style.getPropertyValue('--zoom')).toBe('1.25')
    fireEvent.click(screen.getByLabelText('Smaller'))
    fireEvent.click(screen.getByLabelText('Smaller'))
    fireEvent.click(screen.getByLabelText('Smaller'))
    expect(screen.getByLabelText('Smaller')).toBeDisabled()
    expect(screen.getByLabelText('Current size')).toHaveTextContent('75%')
    // do not leak the choices to the other tests
    localStorage.clear()
  })

  it('App D2 the first font pick sets the title, the second the labels', () => {
    document.location.hash = '#My%20goals=a'
    render(<App />)
    fireEvent.click(screen.getByTitle('Settings'))
    fireEvent.click(screen.getByRole('button', { name: 'caveat' }))
    expect(document.documentElement.dataset.titleFont).toBe('caveat')
    expect(document.documentElement.dataset.labelFont).toBe('indie-flower')
    fireEvent.click(screen.getByRole('button', { name: 'lora' }))
    expect(document.documentElement.dataset.labelFont).toBe('lora')
    // do not leak the choices to the other tests
    localStorage.clear()
  })

  it('App E reorders goals with the keyboard', () => {
    document.location.hash = '#t=a,b,c'
    render(<App />)
    fireEvent.click(screen.getByTitle('Edit'))
    fireEvent.keyDown(screen.getByLabelText('Move goal 1'), { key: 'x' })
    expect(document.location.hash).toBe('#t=a,b,c')
    fireEvent.keyDown(screen.getByLabelText('Move goal 1'), { key: 'ArrowDown' })
    expect(document.location.hash).toBe('#t=b,a,c')
    fireEvent.keyDown(screen.getByLabelText('Move goal 3'), { key: 'ArrowUp' })
    expect(document.location.hash).toBe('#t=b,c,a')
  })

  it('App F reorders goals by dragging a handle', () => {
    document.location.hash = '#t=a,b,c'
    const restore = mockLayout()
    render(<App />)
    fireEvent.click(screen.getByTitle('Edit'))
    const list = screen.getByRole('list')
    fireEvent.pointerMove(list, { clientY: 250 })
    fireEvent.pointerDown(screen.getByLabelText('Move goal 1'))
    fireEvent.pointerMove(list, { clientY: 20 })
    expect(document.location.hash).toBe('#t=a,b,c')
    fireEvent.pointerMove(list, { clientY: 450 })
    expect(document.location.hash).toBe('#t=b,c,a')
    fireEvent.pointerMove(list, { clientY: 120 })
    expect(document.location.hash).toBe('#t=b,a,c')
    fireEvent.pointerUp(globalThis as unknown as Window)
    expect(list).not.toHaveClass('is-dragging')
    restore()
  })

  it('App F2 animates the rows that moved', () => {
    document.location.hash = '#t=a,b,c'
    const animate = vi.fn<() => void>()
    Object.defineProperty(HTMLElement.prototype, 'animate', { configurable: true, value: animate })
    const restore = mockLayout()
    render(<App />)
    fireEvent.click(screen.getByTitle('Edit'))
    fireEvent.keyDown(screen.getByLabelText('Move goal 1'), { key: 'ArrowDown' })
    expect(animate).toHaveBeenCalledWith(expect.any(Array), expect.objectContaining({ duration: 220 }))
    restore()
  })

  it('App G releases the handle when the pointer is cancelled', () => {
    document.location.hash = '#t=a,b'
    render(<App />)
    fireEvent.click(screen.getByTitle('Edit'))
    fireEvent.pointerDown(screen.getByLabelText('Move goal 1'))
    expect(screen.getByRole('list')).toHaveClass('is-dragging')
    fireEvent.pointerCancel(globalThis as unknown as Window)
    expect(screen.getByRole('list')).not.toHaveClass('is-dragging')
  })

  it('App H asks for a confirmation before removing and cancels on blur or when the pointer leaves', () => {
    document.location.hash = '#t=a,b'
    render(<App />)
    fireEvent.click(screen.getByTitle('Edit'))
    fireEvent.click(screen.getByLabelText('Remove a'))
    expect(document.location.hash).toBe('#t=a,b')
    fireEvent.blur(screen.getByLabelText('Confirm removing a'))
    expect(screen.queryByLabelText('Confirm removing a')).toBeNull()
    fireEvent.click(screen.getByLabelText('Remove b'))
    fireEvent.pointerLeave(screen.getByLabelText('Confirm removing b'))
    expect(screen.queryByLabelText('Confirm removing b')).toBeNull()
  })

  it('App I closes the settings with the escape key only', () => {
    document.location.hash = '#t=a'
    render(<App />)
    fireEvent.click(screen.getByTitle('Settings'))
    fireEvent.keyDown(document, { key: 'a' })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('App J celebrates a goal that gets checked off, then stops', () => {
    vi.useFakeTimers()
    document.location.hash = '#t=a,!b'
    render(<App />)
    const label = screen.getByText('a').closest('label')
    expect(label).not.toHaveClass('celebrate')
    fireEvent.click(screen.getByLabelText('a'))
    expect(label).toHaveClass('celebrate')
    act(() => {
      vi.runAllTimers()
    })
    expect(label).not.toHaveClass('celebrate')
    fireEvent.click(screen.getByLabelText('b'))
    expect(screen.getByText('b').closest('label')).not.toHaveClass('celebrate')
    vi.useRealTimers()
  })

  it('App K does not celebrate when the user prefers reduced motion', () => {
    const matchMedia = vi.spyOn(globalThis, 'matchMedia').mockReturnValue({ matches: true } as MediaQueryList)
    document.location.hash = '#t=a'
    render(<App />)
    fireEvent.click(screen.getByLabelText('a'))
    expect(screen.getByText('a').closest('label')).not.toHaveClass('celebrate')
    matchMedia.mockRestore()
  })
})
