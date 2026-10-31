import { setTimeout as sleep } from 'node:timers/promises'
import { fireEvent, render, screen } from '@testing-library/react'
import { EditableText } from './editable-text'

function setup(props: { resetOnCommit?: boolean; value?: string } = {}) {
  const onCommit = vi.fn<(value: string) => void>()
  render(<EditableText label="Field" onCommit={onCommit} value="old" {...props} />)
  return { field: screen.getByLabelText<HTMLTextAreaElement>('Field'), onCommit }
}

const frames = () => sleep(50)

describe('EditableText', () => {
  it('EditableText A commits the sanitized text on blur', () => {
    const { field, onCommit } = setup()
    fireEvent.change(field, { target: { value: '  new,   text ' } })
    fireEvent.blur(field)
    expect(onCommit).toHaveBeenCalledWith('new, text')
    expect(field.value).toBe('new, text')
  })

  it('EditableText B an unchanged text commits nothing', () => {
    const { field, onCommit } = setup()
    fireEvent.change(field, { target: { value: ' old ' } })
    fireEvent.blur(field)
    expect(onCommit).not.toHaveBeenCalled()
    expect(field.value).toBe('old')
  })

  it('EditableText C Enter commits through blur', () => {
    const { field, onCommit } = setup()
    fireEvent.change(field, { target: { value: 'new' } })
    field.focus()
    fireEvent.keyDown(field, { key: 'Enter' })
    expect(onCommit).toHaveBeenCalledWith('new')
    expect(field).not.toHaveFocus()
  })

  it('EditableText D other keys do nothing special', () => {
    const { field, onCommit } = setup()
    fireEvent.keyDown(field, { key: 'a' })
    expect(onCommit).not.toHaveBeenCalled()
  })

  it('EditableText E an empty text is refused : invalid, shaking, nothing committed, focus comes back', async () => {
    const { field, onCommit } = setup()
    field.focus()
    fireEvent.change(field, { target: { value: '   ' } })
    fireEvent.blur(field)
    expect(onCommit).not.toHaveBeenCalled()
    expect(field).toHaveAttribute('aria-invalid', 'true')
    expect(field).toHaveClass('shake')
    await vi.waitFor(() => {
      expect(field).toHaveFocus()
    })
    fireEvent.animationEnd(field)
    expect(field).not.toHaveClass('shake')
  })

  it('EditableText F typing again clears the invalid state', () => {
    const { field } = setup()
    fireEvent.change(field, { target: { value: '' } })
    fireEvent.blur(field)
    expect(field).toHaveAttribute('aria-invalid', 'true')
    fireEvent.input(field, { target: { value: 'x' } })
    expect(field).not.toHaveAttribute('aria-invalid')
  })

  it('EditableText G Escape gives back the committed text and releases an invalid field', async () => {
    const { field, onCommit } = setup()
    field.focus()
    fireEvent.change(field, { target: { value: '' } })
    fireEvent.blur(field)
    field.focus()
    fireEvent.keyDown(field, { key: 'Escape' })
    expect(field.value).toBe('old')
    expect(field).not.toHaveAttribute('aria-invalid')
    expect(field).not.toHaveFocus()
    expect(onCommit).not.toHaveBeenCalled()
    await frames()
    expect(field).not.toHaveFocus()
  })

  it('EditableText H Escape does not reach the document', () => {
    const { field } = setup()
    const onDocumentKeyDown = vi.fn<() => void>()
    document.addEventListener('keydown', onDocumentKeyDown)
    fireEvent.keyDown(field, { key: 'Escape' })
    document.removeEventListener('keydown', onDocumentKeyDown)
    expect(onDocumentKeyDown).not.toHaveBeenCalled()
  })

  it('EditableText I an input that adds things clears on Enter and keeps the focus', async () => {
    const { field, onCommit } = setup({ resetOnCommit: true, value: '' })
    field.focus()
    fireEvent.change(field, { target: { value: ' first ' } })
    fireEvent.keyDown(field, { key: 'Enter' })
    expect(field.value).toBe('')
    expect(field).toHaveFocus()
    fireEvent.keyDown(field, { key: 'Enter' })
    expect(onCommit).toHaveBeenCalledExactlyOnceWith('first')
    await frames()
  })

  it('EditableText J an input that adds things commits on blur and clears, an empty one is normal', () => {
    const { field, onCommit } = setup({ resetOnCommit: true, value: '' })
    fireEvent.blur(field)
    expect(field).not.toHaveAttribute('aria-invalid')
    fireEvent.change(field, { target: { value: 'second' } })
    fireEvent.blur(field)
    expect(onCommit).toHaveBeenCalledWith('second')
    expect(field.value).toBe('')
  })

  it('EditableText K Escape empties an input that adds things', () => {
    const { field, onCommit } = setup({ resetOnCommit: true, value: '' })
    fireEvent.change(field, { target: { value: 'draft' } })
    fireEvent.keyDown(field, { key: 'Escape' })
    expect(field.value).toBe('')
    expect(onCommit).not.toHaveBeenCalled()
  })
})
