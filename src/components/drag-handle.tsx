import type { ButtonHTMLAttributes } from 'react'
import { GripIcon } from './grip-icon'

export type DragHandleProps = ButtonHTMLAttributes<HTMLButtonElement>

type DragHandleOwnProps = DragHandleProps & { index: number }

// press & drag it with a pointer, or focus it, press Space and use the up / down arrows
export function DragHandle({ index, ...props }: DragHandleOwnProps) {
  return (
    <button {...props} aria-label={`Move goal ${index + 1}`} className="icon-button handle" type="button">
      <GripIcon />
    </button>
  )
}
