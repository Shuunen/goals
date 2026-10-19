import type { KeyboardEvent } from 'react'
import { GripIcon } from './grip-icon'

type DragHandleProps = {
  index: number
  onGrab: (index: number) => void
  onMove: (from: number, to: number) => void
}

const keyOffsets: Record<string, number> = { ArrowDown: 1, ArrowUp: -1 }

// grab it with a pointer to drag the row, or focus it and use the up / down arrows
export function DragHandle({ index, onGrab, onMove }: DragHandleProps) {
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const offset = keyOffsets[event.key]
    if (offset === undefined) return
    event.preventDefault()
    onMove(index, index + offset)
  }
  return (
    <button aria-label={`Move goal ${index + 1}`} className="icon-button handle" onKeyDown={onKeyDown} onPointerDown={() => onGrab(index)} type="button">
      <GripIcon />
    </button>
  )
}
