import { render, screen } from '@testing-library/react'
import { ProgressBar } from './progress-bar'

describe('ProgressBar', () => {
  it('ProgressBar A shows the done share to assistive tech', () => {
    render(<ProgressBar done={2} total={5} />)
    const bar = screen.getByRole('progressbar', { name: 'Goals done' })
    expect(bar).toHaveAttribute('aria-valuenow', '2')
    expect(bar).toHaveAttribute('aria-valuemax', '5')
    expect(bar).toHaveAttribute('aria-valuetext', '2 of 5 done')
    expect(bar.firstElementChild).toHaveStyle({ width: '40%' })
  })

  it('ProgressBar B is hidden without goals', () => {
    render(<ProgressBar done={0} total={0} />)
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })
})
