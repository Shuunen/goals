import { act, fireEvent, render, screen } from '@testing-library/react'
import { ShareSection } from './share-section'

const url = 'http://localhost/#t=a'

function setNavigator(values: { clipboard?: { writeText: (text: string) => Promise<void> }; share?: (data: ShareData) => Promise<void> }) {
  Object.defineProperty(globalThis.navigator, 'clipboard', { configurable: true, value: values.clipboard })
  Object.defineProperty(globalThis.navigator, 'share', { configurable: true, value: values.share })
}

describe('ShareSection', () => {
  it('ShareSection A copies the link and says Copied for 2 seconds', async () => {
    vi.useFakeTimers()
    const writeText = vi.fn<(text: string) => Promise<void>>().mockResolvedValue(undefined)
    setNavigator({ clipboard: { writeText } })
    render(<ShareSection title="Mine" url={url} />)
    await act(async () => {
      fireEvent.click(screen.getByText('Copy link'))
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(writeText).toHaveBeenCalledExactlyOnceWith(document.location.href)
    expect(screen.getByText('Copied')).toBeInTheDocument()
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000)
    })
    expect(screen.queryByText('Copied')).not.toBeInTheDocument()
    vi.useRealTimers()
  })

  it('ShareSection B shows the link selected when the clipboard is not available', async () => {
    setNavigator({})
    render(<ShareSection title="Mine" url={url} />)
    fireEvent.click(screen.getByText('Copy link'))
    await screen.findByLabelText('Link to copy')
    const field = screen.getByLabelText<HTMLInputElement>('Link to copy')
    expect(field).toHaveAttribute('readonly')
    expect(field.value).toBe(document.location.href)
    expect(field.selectionEnd).toBe(field.value.length)
  })

  it('ShareSection C offers Share only where the device can share, and shares the link', async () => {
    setNavigator({})
    const view = render(<ShareSection title="Mine" url={url} />)
    expect(screen.queryByText('Share', { selector: 'button' })).not.toBeInTheDocument()
    view.unmount()
    const share = vi.fn<(data: ShareData) => Promise<void>>().mockRejectedValue(new Error('cancelled'))
    setNavigator({ share })
    render(<ShareSection title="Mine" url={url} />)
    fireEvent.click(screen.getByText('Share', { selector: 'button' }))
    await vi.waitFor(() => {
      expect(share).toHaveBeenCalledOnce()
    })
    expect(share).toHaveBeenCalledExactlyOnceWith({ title: 'Mine', url: document.location.href })
  })

  it('ShareSection D tells the length of the link, in red when it is too long', () => {
    setNavigator({})
    const short = render(<ShareSection title="Mine" url={url} />)
    expect(screen.getByText(`${url.length} characters`)).not.toHaveClass('long')
    short.unmount()
    render(<ShareSection title="Mine" url={`http://x/${'a'.repeat(2000)}`} />)
    expect(screen.getByText(/some apps may cut such a long link/u)).toHaveClass('long')
  })
})
