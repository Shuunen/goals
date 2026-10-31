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

function must<Value>(value: Value | undefined | null): Value {
  if (value === undefined || value === null) throw new Error('missing element')
  return value
}

const editButton = () => screen.getByRole('button', { name: /edit goals|done editing/iu })
const pasteOneLine = (field: HTMLElement) => fireEvent.paste(field, { clipboardData: { getData: () => 'one line' } })

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
    fireEvent.click(editButton())
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Mine' } })
    fireEvent.blur(screen.getByLabelText('Title'))
    fireEvent.change(screen.getByLabelText('Goal 3'), { target: { value: 'c' } })
    fireEvent.keyDown(screen.getByLabelText('Goal 3'), { key: 'a' })
    fireEvent.keyDown(screen.getByLabelText('Goal 3'), { key: 'Enter' })
    fireEvent.blur(screen.getByLabelText('Goal 3'))
    fireEvent.change(screen.getByLabelText('New goal'), { target: { value: 'd' } })
    fireEvent.blur(screen.getByLabelText('New goal'))
    fireEvent.click(screen.getAllByLabelText('Remove a')[0])
    expect(document.location.hash).toBe('#Mine=a,c,d')
    fireEvent.click(editButton())
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
    fireEvent.click(editButton())
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
    fireEvent.click(editButton())
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

  it('App H removes at once, the toast gives back the most recent removal where it was', () => {
    document.location.hash = '#t=a,!b,c'
    render(<App />)
    fireEvent.click(editButton())
    fireEvent.click(screen.getByLabelText('Remove b'))
    expect(screen.getByText('Removed “b”')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('Remove a'))
    expect(document.location.hash).toBe('#t=c')
    fireEvent.click(screen.getByText('Undo'))
    expect(document.location.hash).toBe('#t=a,c')
    fireEvent.click(screen.getByLabelText('Remove c'))
    fireEvent.click(screen.getByText('Undo'))
    expect(document.location.hash).toBe('#t=a,c')
    expect(screen.queryByText('Undo')).not.toBeInTheDocument()
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
    fireEvent.click(editButton())
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
    const pencil = editButton()
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

  it('App T Escape leaves the edit mode when no field is focused', () => {
    document.location.hash = '#t=a'
    render(<App />)
    fireEvent.click(editButton())
    expect(screen.getByLabelText('Goal 1')).toBeInTheDocument()
    fireEvent.keyDown(document.body, { key: 'a' })
    expect(screen.getByLabelText('Goal 1')).toBeInTheDocument()
    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(screen.queryByLabelText('Goal 1')).not.toBeInTheDocument()
  })

  it('App U Escape in a field only gives the text back, the edit mode stays', () => {
    document.location.hash = '#t=a'
    render(<App />)
    fireEvent.click(editButton())
    const field = screen.getByLabelText('Goal 1')
    field.focus()
    fireEvent.keyDown(field, { key: 'Escape' })
    expect(screen.getByLabelText('Goal 1')).toBeInTheDocument()
    field.focus()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(screen.getByLabelText('Goal 1')).toBeInTheDocument()
  })

  it('App V Escape keeps the edit mode during a drag, with the settings open or on a toast button', () => {
    document.location.hash = '#t=!a'
    render(<App />)
    fireEvent.click(editButton())
    document.querySelector('ul.list')?.classList.add('is-dragging')
    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(screen.getByLabelText('Goal 1')).toBeInTheDocument()
    document.querySelector('ul.list')?.classList.remove('is-dragging')
    fireEvent.click(screen.getByTitle('Settings'))
    fireEvent.keyDown(document.body, { key: 'Escape' })
    fireEvent.click(screen.getByText('Reset all'))
    screen.getByText('Undo').focus()
    fireEvent.keyDown(screen.getByText('Undo'), { key: 'Escape' })
    expect(screen.getByLabelText('Goal 1')).toBeInTheDocument()
  })

  it('App W the add button adds what was typed, empties the field and keeps the focus', () => {
    document.location.hash = '#t=a'
    render(<App />)
    fireEvent.click(editButton())
    const field = screen.getByLabelText('New goal')
    field.focus()
    fireEvent.change(field, { target: { value: 'b' } })
    fireEvent.pointerDown(screen.getByLabelText('Add goal'))
    fireEvent.click(screen.getByLabelText('Add goal'))
    expect(document.location.hash).toBe('#t=a,b')
    expect(field).toHaveValue('')
    expect(field).toHaveFocus()
  })

  it('App X the add button on an empty field only focuses it', () => {
    document.location.hash = '#t=a'
    render(<App />)
    fireEvent.click(editButton())
    fireEvent.click(screen.getByLabelText('Add goal'))
    expect(screen.getByLabelText('New goal')).toHaveFocus()
    expect(document.location.hash).toBe('#t=a')
  })

  it('App Y pasting several lines adds several goals at once, with one undo', () => {
    document.location.hash = '#t=a'
    render(<App />)
    fireEvent.click(editButton())
    const field = screen.getByLabelText('New goal')
    fireEvent.paste(field, { clipboardData: { getData: () => '- [x] b\n* c\n\n1. d' } })
    expect(document.location.hash).toBe('#t=a,!b,c,d')
    expect(screen.getByText('Added 3 goals')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Undo'))
    expect(document.location.hash).toBe('#t=a')
  })

  it('App Z pasting a single line is a normal paste, in the add row and in a goal', () => {
    document.location.hash = '#t=a'
    render(<App />)
    fireEvent.click(editButton())
    expect(pasteOneLine(screen.getByLabelText('New goal'))).toBe(true)
    expect(pasteOneLine(screen.getByLabelText('Goal 1'))).toBe(true)
    expect(document.location.hash).toBe('#t=a')
  })

  it('App AA the edit button says what it does, without a pressed state, and the gear is named', () => {
    document.location.hash = '#t=a'
    render(<App />)
    expect(screen.getByRole('button', { name: 'Edit goals' })).not.toHaveAttribute('aria-pressed')
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument()
    fireEvent.click(editButton())
    expect(screen.getByRole('button', { name: 'Done editing' })).toHaveAttribute('title', 'Done editing')
    expect(screen.getByRole('button', { name: 'Done editing' })).toHaveAttribute('data-editing', 'true')
  })

  it('App AB clear done removes every done goal in edit mode, and the toast gives them back', () => {
    document.location.hash = '#t=a,!b,c,!d'
    render(<App />)
    expect(screen.getByText('Clear done (2)').closest('button')).toHaveAttribute('inert')
    fireEvent.click(editButton())
    expect(screen.getByText('Clear done (2)').closest('button')).not.toHaveAttribute('inert')
    fireEvent.click(screen.getByText('Clear done (2)'))
    expect(document.location.hash).toBe('#t=a,c')
    expect(screen.getByText('Cleared 2 done goals')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Undo'))
    expect(document.location.hash).toBe('#t=a,!b,c,!d')
  })

  it('App AC clear done says goal for a single one and can empty the list', () => {
    document.location.hash = '#t=!a'
    render(<App />)
    fireEvent.click(editButton())
    fireEvent.click(screen.getByText('Clear done (1)'))
    expect(screen.getByText('Cleared 1 done goal')).toBeInTheDocument()
    expect(document.location.hash).toBe('#t=')
  })

  it('App AD the settings take the focus when they open and give it back to the gear when they close', () => {
    document.location.hash = '#t=a'
    render(<App />)
    const gear = screen.getByRole('button', { name: 'Settings' })
    gear.focus()
    fireEvent.click(gear)
    expect(screen.getByRole('dialog', { name: 'Settings' })).toHaveFocus()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(gear).toHaveFocus()
  })

  it('App AE the settings keep Tab and Shift+Tab inside, turning around at both ends', () => {
    document.location.hash = '#t=!a'
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Settings' }))
    const dialog = screen.getByRole('dialog', { name: 'Settings' })
    const inside = [...dialog.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled)')]
    const first = must(inside.at(0))
    const last = must(inside.at(-1))
    last.focus()
    fireEvent.keyDown(last, { key: 'Tab' })
    expect(first).toHaveFocus()
    fireEvent.keyDown(first, { key: 'Tab', shiftKey: true })
    expect(last).toHaveFocus()
    dialog.focus()
    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true })
    expect(last).toHaveFocus()
  })

  it('App AF Tab in the middle of the settings is left to the browser', () => {
    document.location.hash = '#t=a'
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Settings' }))
    const dialog = screen.getByRole('dialog', { name: 'Settings' })
    const middle = must(dialog.querySelectorAll<HTMLElement>('button').item(1))
    middle.focus()
    expect(fireEvent.keyDown(middle, { key: 'Tab' })).toBe(true)
    expect(fireEvent.keyDown(middle, { key: 'a' })).toBe(true)
  })

  it('App AG the size stepper offers a Reset only away from 100%, and announces the size politely', () => {
    localStorage.clear()
    document.location.hash = '#t=a'
    render(<App />)
    expect(screen.queryByText('Reset')).not.toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('Larger'))
    expect(screen.getByLabelText('Current size')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByLabelText('Current size')).toHaveTextContent('110%')
    fireEvent.click(screen.getByText('Reset'))
    expect(screen.getByLabelText('Current size')).toHaveTextContent('100%')
  })

  it('App AH a long list warns in edit mode only, and the settings tell the link length', () => {
    const long = Array.from({ length: 150 }, (_unused, index) => `goal number ${index}`).join(',')
    document.location.hash = `#t=${long}`
    render(<App />)
    const warning = screen.getByText(/getting long/u)
    expect(warning).toHaveAttribute('aria-hidden', 'true')
    fireEvent.click(editButton())
    expect(warning).toHaveAttribute('aria-hidden', 'false')
    expect(screen.getByText(/some apps may cut such a long link/u)).toBeInTheDocument()
  })

  it('App AI a short list shows no warning', () => {
    document.location.hash = '#t=a'
    render(<App />)
    expect(screen.queryByText(/getting long/u)).not.toBeInTheDocument()
  })

  it('App AJ importing replaces the list and its title, and the toast gives the old list back', () => {
    document.location.hash = '#Old=x,y'
    render(<App />)
    fireEvent.change(screen.getByLabelText('Paste a list to import'), { target: { value: '# New\n- a\n- [x] b' } })
    fireEvent.click(screen.getByText('Replace my list'))
    expect(screen.getByText('List replaced by 2 goals')).toBeInTheDocument()
    expect(document.location.hash).toBe('#New=a,!b')
    fireEvent.click(screen.getByText('Undo'))
    expect(document.location.hash).toBe('#Old=x,y')
  })

  it('App AK importing plain lines keeps the current title', () => {
    document.location.hash = '#Old=x'
    render(<App />)
    fireEvent.change(screen.getByLabelText('Paste a list to import'), { target: { value: 'one\ntwo' } })
    fireEvent.click(screen.getByText('Replace my list'))
    expect(document.location.hash).toBe('#Old=one,two')
  })

  it('App AL clear everything wipes the storage and reloads', () => {
    localStorage.setItem('goals-saved', '#t=a')
    document.location.hash = '#t=a'
    const reload = vi.spyOn(globalThis.location, 'reload').mockReturnValue(undefined)
    render(<App />)
    fireEvent.click(screen.getByText('Clear everything'))
    fireEvent.click(screen.getByText('Yes, clear'))
    expect(localStorage.getItem('goals-saved')).toBeNull()
    expect(reload).toHaveBeenCalledOnce()
    reload.mockRestore()
  })
})
