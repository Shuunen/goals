import type { KeyboardEvent } from 'react'

type EditableTextProps = {
  className?: string
  label: string
  onCommit: (value: string) => void
  placeholder?: string
  value: string
}

function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
  if (event.key !== 'Enter') return
  // a goal is a single line of text, Enter commits instead of adding a line break
  event.preventDefault()
  event.currentTarget.blur()
}

// a text area that looks like the text it replaces & wraps long text, committed on blur or Enter
export function EditableText({ className, label, onCommit, placeholder, value }: EditableTextProps) {
  return <textarea aria-label={label} className={`editable ${className ?? ''}`} defaultValue={value} onBlur={event => onCommit(event.target.value)} onKeyDown={onKeyDown} placeholder={placeholder} rows={1} />
}
