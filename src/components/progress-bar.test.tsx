import { fireEvent, render, screen } from '@testing-library/react'
import { ProgressBar } from './progress-bar'

function mockMotion(reduced: boolean) {
  vi.stubGlobal('matchMedia', () => ({ matches: reduced }))
}

const wrapOf = (container: HTMLElement) => container.querySelector('.progress-wrap')

describe('ProgressBar', () => {
  it('ProgressBar A shows the done share to assistive tech', () => {
    mockMotion(false)
    render(<ProgressBar done={2} isEditing={false} total={5} />)
    const bar = screen.getByRole('progressbar', { name: 'Goals done' })
    expect(bar).toHaveAttribute('aria-valuenow', '2')
    expect(bar).toHaveAttribute('aria-valuemax', '5')
    expect(bar).toHaveAttribute('aria-valuetext', '2 of 5 done')
    expect(bar.firstElementChild).toHaveStyle({ width: '40%' })
  })

  it('ProgressBar B is hidden without goals', () => {
    mockMotion(false)
    render(<ProgressBar done={0} isEditing={false} total={0} />)
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('ProgressBar C celebrates the last goal being done, until the glow ends', () => {
    mockMotion(false)
    const { container, rerender } = render(<ProgressBar done={1} isEditing={false} total={2} />)
    expect(wrapOf(container)).not.toHaveClass('celebrate')
    rerender(<ProgressBar done={2} isEditing={false} total={2} />)
    expect(wrapOf(container)).toHaveClass('celebrate')
    const wrap = wrapOf(container) ?? container
    fireEvent.animationEnd(wrap, { animationName: 'confetti-burst' })
    expect(wrap).toHaveClass('celebrate')
    fireEvent.animationEnd(wrap, { animationName: 'glow' })
    expect(wrap).not.toHaveClass('celebrate')
  })

  it('ProgressBar D never celebrates on load, in edit mode or with reduced motion', () => {
    mockMotion(false)
    const loaded = render(<ProgressBar done={2} isEditing={false} total={2} />)
    expect(wrapOf(loaded.container)).not.toHaveClass('celebrate')
    loaded.unmount()
    const editing = render(<ProgressBar done={1} isEditing total={2} />)
    editing.rerender(<ProgressBar done={2} isEditing total={2} />)
    expect(wrapOf(editing.container)).not.toHaveClass('celebrate')
    editing.unmount()
    mockMotion(true)
    const reduced = render(<ProgressBar done={1} isEditing={false} total={2} />)
    reduced.rerender(<ProgressBar done={2} isEditing={false} total={2} />)
    expect(wrapOf(reduced.container)).not.toHaveClass('celebrate')
  })
})
