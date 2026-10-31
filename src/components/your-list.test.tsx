import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createItem } from '../models/item.model'
import { downloadFile } from '../utils/download.utils'
import { maxImportedGoals } from '../utils/goals-file.utils'
import { YourList } from './your-list'

vi.mock(import('../utils/download.utils'), () => ({ downloadFile: vi.fn<() => void>() }))

const items = [createItem('a', false), createItem('b', true)]

function setup(canReset = true) {
  const props = { canReset, items, onClear: vi.fn<() => void>(), onReplace: vi.fn<(items: unknown[], title?: string) => void>(), onReset: vi.fn<() => void>(), title: 'Mine' }
  render(<YourList {...props} />)
  return props
}

function setClipboard(writeText?: (text: string) => Promise<void>) {
  Object.defineProperty(globalThis.navigator, 'clipboard', { configurable: true, value: writeText ? { writeText } : undefined })
}

describe('YourList', () => {
  it('YourList A reset all is there, disabled when nothing is done', () => {
    const props = setup()
    fireEvent.click(screen.getByText('Reset all'))
    expect(props.onReset).toHaveBeenCalledOnce()
    expect(screen.getByText('Reset all')).toBeEnabled()
  })

  it('YourList B reset all is disabled without anything done', () => {
    setup(false)
    expect(screen.getByText('Reset all')).toBeDisabled()
  })

  it('YourList C downloads the json under a file name made from the title', () => {
    setup()
    fireEvent.click(screen.getByText('Download JSON'))
    expect(downloadFile).toHaveBeenCalledExactlyOnceWith('goals-mine.json', expect.stringContaining('"version": 1'))
  })

  it('YourList D copies a Markdown checklist and says Copied', async () => {
    const writeText = vi.fn<(text: string) => Promise<void>>().mockResolvedValue(undefined)
    setClipboard(writeText)
    setup()
    fireEvent.click(screen.getByText('Copy as text'))
    await screen.findByText('Copied')
    expect(writeText).toHaveBeenCalledExactlyOnceWith('# Mine\n\n- [ ] a\n- [x] b\n')
  })

  it('YourList E shows the text selected when the clipboard fails', async () => {
    setClipboard()
    setup()
    fireEvent.click(screen.getByText('Copy as text'))
    const field = await screen.findByLabelText<HTMLTextAreaElement>('Text to copy')
    expect(field).toHaveAttribute('readonly')
    expect(field.value).toContain('- [x] b')
  })

  it('YourList F pasted text is counted, then replaces the list with its title', () => {
    const props = setup()
    expect(screen.queryByText(/goals found/u)).not.toBeInTheDocument()
    expect(screen.getByText('Replace my list')).toBeDisabled()
    const field = screen.getByLabelText('Paste a list to import')
    fireEvent.change(field, { target: { value: '# New\n- [x] one\n- two' } })
    expect(screen.getByText('2 goals found')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Replace my list'))
    expect(props.onReplace).toHaveBeenCalledExactlyOnceWith([createItem('one', true), createItem('two', false)], 'New')
    expect(field).toHaveValue('')
  })

  it('YourList G says when nothing was found, and when the list was cut', () => {
    setup()
    const field = screen.getByLabelText('Paste a list to import')
    fireEvent.change(field, { target: { value: '{ broken' } })
    expect(screen.getByText('No goals found')).toBeInTheDocument()
    fireEvent.change(field, { target: { value: Array.from({ length: maxImportedGoals + 1 }, (_unused, index) => `g${index}`).join('\n') } })
    expect(screen.getByText(`${maxImportedGoals} goals found, only the first ${maxImportedGoals} are kept`)).toBeInTheDocument()
  })

  it('YourList H a picked file fills the import, and no file does nothing', async () => {
    setup()
    const picker = screen.getByLabelText<HTMLInputElement>('Import a file')
    fireEvent.change(picker, { target: { files: [] } })
    expect(screen.queryByText(/goals found/u)).not.toBeInTheDocument()
    fireEvent.change(picker, { target: { files: [new File(['- a\n- b\n- c'], 'list.md', { type: 'text/markdown' })] } })
    await waitFor(() => {
      expect(screen.getByText('3 goals found')).toBeInTheDocument()
    })
  })

  it('YourList I clearing everything takes two steps and can be cancelled', () => {
    const props = setup()
    fireEvent.click(screen.getByText('Clear everything'))
    expect(screen.getByRole('alert')).toHaveTextContent('cannot be undone')
    fireEvent.click(screen.getByText('Cancel'))
    expect(props.onClear).not.toHaveBeenCalled()
    fireEvent.click(screen.getByText('Clear everything'))
    fireEvent.click(screen.getByText('Yes, clear'))
    expect(props.onClear).toHaveBeenCalledOnce()
  })
})
