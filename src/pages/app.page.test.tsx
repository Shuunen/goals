import { fireEvent, render, screen } from '@testing-library/react'
import { App } from './app.page'

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
})
