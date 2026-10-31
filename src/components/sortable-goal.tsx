import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Item } from '../models/item.model'
import { GoalRow } from './goal-row'

type SortableGoalProps = {
  id: string
  index: number
  isEditing: boolean
  item: Item
  onRemove: (index: number) => void
  onRename: (index: number, value: string) => void
  onToggle: (index: number) => void
}

// a goal that can be sorted by its handle : the others slide out of its way while it is dragged
export function SortableGoal({ id, index, isEditing, item, onRemove, onRename, onToggle }: SortableGoalProps) {
  const { attributes, isDragging, listeners, setNodeRef, transform, transition } = useSortable({ disabled: !isEditing, id })
  return (
    <li className={isDragging ? 'dragging' : ''} data-flip={id} ref={setNodeRef} style={{ transform: CSS.Translate.toString(transform), transition }}>
      <GoalRow handleProps={{ ...attributes, ...listeners }} index={index} isEditing={isEditing} item={item} onRemove={onRemove} onRename={onRename} onToggle={onToggle} />
    </li>
  )
}
