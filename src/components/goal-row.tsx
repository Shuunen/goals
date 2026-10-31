import { useState } from 'react'
import type { Item } from '../models/item.model'
import { DragHandle, type DragHandleProps } from './drag-handle'
import { EditableText } from './editable-text'
import { RemoveButton } from './remove-button'

const celebrationDuration = 500

type GoalRowProps = {
  handleProps?: DragHandleProps
  index: number
  isEditing: boolean
  item: Item
  onRemove: (index: number) => void
  onRename: (index: number, value: string) => void
  onToggle: (index: number) => void
}

export function GoalRow({ handleProps, index, isEditing, item, onRemove, onRename, onToggle }: GoalRowProps) {
  const [isCelebrating, setIsCelebrating] = useState(false)
  if (isEditing)
    return (
      <div className="item editing">
        <DragHandle index={index} {...handleProps} />
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
