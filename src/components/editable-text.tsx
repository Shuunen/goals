import { useState, type ClipboardEvent, type KeyboardEvent, type Ref } from 'react'
import type { Item } from '../models/item.model'
import { parseGoalLines } from '../utils/goal-lines.utils'
import { sanitizeText } from '../utils/hash.utils'

type EditableTextProps = {
  className?: string
  label: string
  onCommit: (value: string) => void
  // pasting several lines becomes several goals, when this is given
  onPasteItems?: (items: Item[]) => void
  placeholder?: string
  ref?: Ref<HTMLTextAreaElement>
  // an input that adds things : committing empties it & keeps the focus, an empty one is normal
  resetOnCommit?: boolean
  value: string
}

const minPastedGoals = 2

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

// an empty text is refused : red outline, shake, and the focus stays
function refuse(field: HTMLTextAreaElement, setIsInvalid: (isInvalid: boolean) => void) {
  setIsInvalid(true)
  shake(field)
  refocusIfInvalid(field)
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

// several pasted lines are several goals, a single line is a normal paste
function pasteLines(event: ClipboardEvent<HTMLTextAreaElement>, onPasteItems?: (items: Item[]) => void) {
  const items = parseGoalLines(event.clipboardData.getData('text'))
  if (!onPasteItems || items.length < minPastedGoals) return
  event.preventDefault()
  onPasteItems(items)
}

// a text area that looks like the text it replaces & wraps long text, committed on blur or Enter
// Escape gives back the last committed text, an empty text is refused : shake, red outline & the focus stays
export function EditableText({ className, label, onCommit, onPasteItems, placeholder, ref, resetOnCommit = false, value }: Readonly<EditableTextProps>) {
  const [isInvalid, setIsInvalid] = useState(false)

  const commit = (field: HTMLTextAreaElement) => {
    const text = sanitizeText(field.value)
    if (resetOnCommit) {
      field.value = ''
      if (text.length > 0) onCommit(text)
    } else if (text.length === 0) refuse(field, setIsInvalid)
    else {
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
      onPaste={event => pasteLines(event, onPasteItems)}
      placeholder={placeholder}
      ref={ref}
      rows={1}
    />
  )
}
