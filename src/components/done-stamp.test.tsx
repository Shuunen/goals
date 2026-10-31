import { render, screen } from '@testing-library/react'
import { DoneStamp } from './done-stamp'

describe('DoneStamp', () => {
  it('DoneStamp A announces the finished list', () => {
    render(<DoneStamp />)
    expect(screen.getByRole('status')).toHaveTextContent('All goals done')
  })
})
