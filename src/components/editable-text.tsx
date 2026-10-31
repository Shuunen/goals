import { useState, type KeyboardEvent } from 'react'
import { sanitizeText } from '../utils/hash.utils'

type EditableTextProps = {
  className?: string
  label: string
  onCommit: (value: string) => void
  placeholder?: string
  // an input that adds things : committing empties it & keeps the focus, an empty one is normal
  resetOnCommit?: boolean
  value: string
}

function shake(field: HTMLTextAreaElement) {
  field.classList.remove('shake')
  // reading a layout value restarts the animation when it was already playing
  void field.offsetWidth
  field.classList.add('shake')
}

// focusing during the blur is ignored by some browsers, so it waits for the next frame, unless Escape or typing fixed the field meanwhile
function refocusIfInvalid(field: HTMLTextAreaElement) {
  globalThis.requestAnimationFrame(() => {
    if (field.getAttribute('aria-invalid') === 'true') field.focus()
  })
}

// typing several goals in a row, on mobile the keyboard stays open & the new row stays in sight
function keepInSight(field: HTMLTextAreaElement) {
  globalThis.requestAnimationFrame(() => field.scrollIntoView({ block: 'nearest' }))
}

// gives back a text and releases the field, without letting the app see the Escape
function leave(event: KeyboardEvent<HTMLTextAreaElement>, text: string) {
  event.preventDefault()
  event.stopPropagation()
  event.currentTarget.value = text
  event.currentTarget.blur()
}

// a text area that looks like the text it replaces & wraps long text, committed on blur or Enter
// Escape gives back the last committed text, an empty text is refused : shake, red outline & the focus stays
export function EditableText({ className, label, onCommit, placeholder, resetOnCommit = false, value }: Readonly<EditableTextProps>) {
  const [isInvalid, setIsInvalid] = useState(false)

  const commit = (field: HTMLTextAreaElement) => {
    const text = sanitizeText(field.value)
    if (resetOnCommit) {
      field.value = ''
      if (text.length > 0) onCommit(text)
    } else if (text.length === 0) {
      setIsInvalid(true)
      shake(field)
      refocusIfInvalid(field)
    } else {
      field.value = text
      // an unchanged text is not a change : no hash write
      if (text !== value) onCommit(text)
    }
  }

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    const field = event.currentTarget
    if (event.key === 'Escape') {
      // the app also uses Escape to leave the edit mode, but only when nothing is being typed
      leave(event, resetOnCommit ? '' : value)
      setIsInvalid(false)
    } else if (event.key === 'Enter') {
      // a goal is a single line of text, Enter commits instead of adding a line break
      event.preventDefault()
      if (resetOnCommit) {
        commit(field)
        keepInSight(field)
      } else field.blur()
    }
  }

  return (
    <textarea
      aria-invalid={isInvalid || undefined}
      aria-label={label}
      className={`editable ${className ?? ''}`}
      defaultValue={value}
      onAnimationEnd={event => event.currentTarget.classList.remove('shake')}
      onBlur={event => commit(event.target)}
      onInput={() => setIsInvalid(false)}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      rows={1}
    />
  )
}
