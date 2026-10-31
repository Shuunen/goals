import { act, fireEvent, render, screen } from '@testing-library/react'
import { App } from './app.page'

function indexOf(element: HTMLElement) {
  return [...(element.parentElement?.children ?? [])].indexOf(element)
}

// happy-dom does not implement the layout, so rows are stacked 100px apart in the order of the dom
function mockLayout() {
  const rect = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function mock(this: HTMLElement) {
    const top = indexOf(this) * 100
    return { bottom: top + 100, height: 100, left: 0, right: 300, top, width: 300 } as DOMRect
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

// lets dnd-kit run its own state updates, which it schedules after the event
async function settle() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(0)
  })
}

// the page is 3000px tall in a 500px window, scrolled to a position
function scrollDown(position: number) {
  Object.defineProperty(globalThis, 'scrollY', { configurable: true, value: position })
  Object.defineProperty(globalThis, 'innerHeight', { configurable: true, value: 500 })
  Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: 3000 })
  act(() => {
    globalThis.dispatchEvent(new Event('scroll'))
  })
}

describe('App', () => {
  it('App A renders title & items from the hash', () => {
    document.location.hash = '#My%20goals=have%20fun,!avoid%20shitty%20job'
    render(<App />)
    expect(screen.getByText('My goals')).toBeInTheDocument()
    expect(screen.getByText('have fun')).toBeInTheDocument()
    expect(screen.getByText('avoid shitty job')).toBeInTheDocument()
  })

  it('App B toggles an item when clicked, it sinks below the open ones', () => {
    document.location.hash = '#My%20goals=have%20fun,!avoid%20shitty%20job'
    render(<App />)
    const checkbox = screen.getByText('have fun').closest('label')?.querySelector('input')
    expect(checkbox).not.toBeNull()
    if (checkbox) fireEvent.click(checkbox)
    expect(document.location.hash).toBe('#My%20goals=!avoid%20shitty%20job,!have%20fun')
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
    expect(screen.getByLabelText('Current size')).toHaveTextContent('110%')
    expect(document.documentElement.style.getPropertyValue('--zoom')).toBe('1.1')
    for (let step = 0; step < 10; step += 1) fireEvent.click(screen.getByLabelText('Smaller'))
    expect(screen.getByLabelText('Smaller')).toBeDisabled()
    expect(screen.getByLabelText('Current size')).toHaveTextContent('10%')
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

  it('App E reorders goals with the keyboard : Space picks up, arrows move, Space drops', async () => {
    vi.useFakeTimers()
    document.location.hash = '#t=a,b,c'
    const restore = mockLayout()
    render(<App />)
    fireEvent.click(screen.getByTitle('Edit'))
    const handle = screen.getByLabelText('Move goal 1')
    handle.focus()
    fireEvent.keyDown(handle, { code: 'Space', key: ' ' })
    await settle()
    expect(screen.getByRole('list')).toHaveClass('is-dragging')
    fireEvent.keyDown(document, { code: 'ArrowDown', key: 'ArrowDown' })
    await settle()
    fireEvent.keyDown(document, { code: 'Space', key: ' ' })
    await settle()
    expect(document.location.hash).toBe('#t=b,a,c')
    expect(screen.getByRole('list')).not.toHaveClass('is-dragging')
    restore()
    vi.useRealTimers()
  })

  it('App F leaves the order alone when a drag is cancelled', async () => {
    vi.useFakeTimers()
    document.location.hash = '#t=a,b,c'
    const restore = mockLayout()
    render(<App />)
    fireEvent.click(screen.getByTitle('Edit'))
    const handle = screen.getByLabelText('Move goal 1')
    handle.focus()
    fireEvent.keyDown(handle, { code: 'Space', key: ' ' })
    await settle()
    fireEvent.keyDown(document, { code: 'ArrowDown', key: 'ArrowDown' })
    fireEvent.keyDown(document, { code: 'Escape', key: 'Escape' })
    await settle()
    expect(document.location.hash).toBe('#t=a,b,c')
    expect(screen.getByRole('list')).not.toHaveClass('is-dragging')
    restore()
    vi.useRealTimers()
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
    const matchMedia = vi.spyOn(globalThis, 'matchMedia').mockReturnValue({ addEventListener: vi.fn<() => void>(), matches: true, removeEventListener: vi.fn<() => void>() } as unknown as MediaQueryList)
    document.location.hash = '#t=a'
    render(<App />)
    fireEvent.click(screen.getByLabelText('a'))
    expect(screen.getByText('a').closest('label')).not.toHaveClass('celebrate')
    matchMedia.mockRestore()
  })

  it('App L shows a hint for an empty list, except while editing', () => {
    localStorage.clear()
    document.location.hash = '#Mine='
    render(<App />)
    expect(screen.getByText('Tap the pencil to add a goal')).toBeInTheDocument()
    fireEvent.click(screen.getByTitle('Edit'))
    expect(screen.queryByText('Tap the pencil to add a goal')).not.toBeInTheDocument()
  })

  it('App M shows no hint when there are goals', () => {
    document.location.hash = '#t=a'
    render(<App />)
    expect(screen.queryByText('Tap the pencil to add a goal')).not.toBeInTheDocument()
  })

  it('App N the corner buttons step aside while scrolling down, but not while editing or with the settings open', () => {
    vi.stubGlobal('requestAnimationFrame', (task: () => void) => {
      task()
      return 0
    })
    document.location.hash = '#t=a'
    render(<App />)
    const gear = screen.getByTitle('Settings')
    const pencil = screen.getByTitle('Edit')
    scrollDown(300)
    expect(gear).toHaveClass('is-away')
    expect(pencil).toHaveClass('is-away')
    fireEvent.click(pencil)
    expect(pencil).not.toHaveClass('is-away')
    fireEvent.click(pencil)
    scrollDown(600)
    expect(pencil).toHaveClass('is-away')
    fireEvent.click(gear)
    expect(gear).not.toHaveClass('is-away')
    vi.unstubAllGlobals()
    Object.defineProperty(globalThis, 'scrollY', { configurable: true, value: 0 })
  })

  it('App O reset all unchecks every goal, keeps the order and the toast gives them back', () => {
    document.location.hash = '#t=a,!b,!c'
    render(<App />)
    fireEvent.click(screen.getByTitle('Settings'))
    fireEvent.click(screen.getByText('Reset all'))
    expect(document.location.hash).toBe('#t=a,b,c')
    expect(screen.getByText('All goals unchecked')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Undo'))
    expect(document.location.hash).toBe('#t=a,!b,!c')
    expect(screen.queryByText('All goals unchecked')).not.toBeInTheDocument()
  })

  it('App Q reset all is disabled when nothing is done', () => {
    document.location.hash = '#t=a'
    render(<App />)
    expect(screen.getByText('Reset all')).toBeDisabled()
  })

  it('App P the undo is forgotten once the toast expires', () => {
    vi.useFakeTimers()
    document.location.hash = '#t=!a'
    render(<App />)
    fireEvent.click(screen.getByText('Reset all'))
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(screen.queryByText('All goals unchecked')).not.toBeInTheDocument()
    vi.useRealTimers()
  })

  it('App R a goal getting checked gives a short vibration, unchecking or editing does not', () => {
    const vibrate = vi.fn<(pattern: number) => boolean>()
    Object.defineProperty(globalThis.navigator, 'vibrate', { configurable: true, value: vibrate })
    document.location.hash = '#t=a,!b'
    render(<App />)
    fireEvent.click(screen.getByLabelText('a'))
    expect(vibrate).toHaveBeenCalledExactlyOnceWith(10)
    fireEvent.click(screen.getByLabelText('a'))
    expect(vibrate).toHaveBeenCalledOnce()
    Object.defineProperty(globalThis.navigator, 'vibrate', { configurable: true, value: undefined })
  })

  it('App S checking a goal works where the device cannot vibrate', () => {
    Object.defineProperty(globalThis.navigator, 'vibrate', { configurable: true, value: undefined })
    document.location.hash = '#t=a'
    render(<App />)
    fireEvent.click(screen.getByLabelText('a'))
    expect(document.location.hash).toBe('#t=!a')
  })
})
