import { setTimeout as sleep } from 'node:timers/promises'
import { render, screen, waitFor } from '@testing-library/react'
import { DoneIllustration } from './done-illustration'

describe('DoneIllustration', () => {
  it('DoneIllustration A announces the finished list', () => {
    render(<DoneIllustration />)
    expect(screen.getByRole('status')).toHaveTextContent('All goals done')
  })

  it('DoneIllustration B shows one of the animated illustrations once loaded', async () => {
    const { container } = render(<DoneIllustration />)
    await waitFor(() => expect(container.querySelector('svg.done-illustration-art')).not.toBeNull())
  })

  it('DoneIllustration B2 every illustration of src/assets loads and renders, whichever one is picked', async () => {
    const count = Object.keys(import.meta.glob('../assets/*.tsx')).length
    const random = vi.spyOn(Math, 'random')
    for (let index = 0; index < count; index += 1) {
      random.mockReturnValueOnce(index / count)
      render(<DoneIllustration />)
    }
    random.mockRestore()
    await waitFor(() => expect(document.querySelectorAll('svg.done-illustration-art')).toHaveLength(count), { timeout: 5000 })
  })

  it('DoneIllustration C shows nothing late when it is gone before the illustration loads', async () => {
    const { unmount } = render(<DoneIllustration />)
    unmount()
    await sleep(200)
    expect(document.querySelector('svg.done-illustration-art')).toBeNull()
  })
})
