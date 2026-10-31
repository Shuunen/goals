import { useState } from 'react'
import type { Item } from '../models/item.model'
import { DragHandle } from './drag-handle'
import { EditableText } from './editable-text'
import { RemoveButton } from './remove-button'

const celebrationDuration = 500

type GoalRowProps = {
  index: number
  isEditing: boolean
  item: Item
  onGrab: (index: number) => void
  onMove: (from: number, to: number) => void
  onRemove: (index: number) => void
  onRename: (index: number, value: string) => void
  onToggle: (index: number) => void
}

export function GoalRow({ index, isEditing, item, onGrab, onMove, onRemove, onRename, onToggle }: GoalRowProps) {
  const [isCelebrating, setIsCelebrating] = useState(false)
  if (isEditing)
    return (
      <div className="item editing">
        <DragHandle index={index} onGrab={onGrab} onMove={onMove} />
        <EditableText label={`Goal ${index + 1}`} onCommit={value => onRename(index, value)} value={item.title} />
        <RemoveButton onRemove={() => onRemove(index)} title={item.title} />
      </div>
    )
  // only the moment a goal gets checked off deserves a burst, never a goal that merely loads already done
  const onChange = () => {
    if (!item.isDone && !globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsCelebrating(true)
      setTimeout(() => setIsCelebrating(false), celebrationDuration)
    }
    onToggle(index)
  }
  return (
    <label className={`item ${item.isDone ? 'done' : ''} ${isCelebrating ? 'celebrate' : ''}`}>
      <input checked={item.isDone} onChange={onChange} type="checkbox" />
      <span className="title">{item.title}</span>
    </label>
  )
}
