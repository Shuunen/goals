import type { KeyboardEvent } from 'react'

type EditableTextProps = {
  className?: string
  label: string
  onCommit: (value: string) => void
  placeholder?: string
  value: string
}

function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
  if (event.key === 'Enter') event.currentTarget.blur()
}

// a text input that looks like the text it replaces, committed on blur or Enter
export function EditableText({ className, label, onCommit, placeholder, value }: EditableTextProps) {
  return <input aria-label={label} className={`editable ${className ?? ''}`} defaultValue={value} onBlur={event => onCommit(event.target.value)} onKeyDown={onKeyDown} placeholder={placeholder} type="text" />
}
