import type { RefObject } from 'react'
import { PlusIcon } from './plus-icon'

type AddButtonProps = { field: RefObject<HTMLTextAreaElement | null> }

// the add field commits & empties itself when it loses the focus, so leaving it & coming back adds what was typed
// the pointer press is kept from stealing the focus, so on mobile the keyboard stays open
export function AddButton({ field }: Readonly<AddButtonProps>) {
  const add = () => {
    field.current?.blur()
    field.current?.focus()
  }
  return (
    <button aria-label="Add goal" className="icon-button add" onClick={add} onPointerDown={event => event.preventDefault()} type="button">
      <PlusIcon />
    </button>
  )
}
