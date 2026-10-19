import { useDragReorder } from '../hooks/use-drag-reorder'
import { useFlip } from '../hooks/use-flip'
import type { Item } from '../models/item.model'
import { EditableText } from './editable-text'
import { GoalRow } from './goal-row'

type GoalListProps = {
  isEditing: boolean
  items: Item[]
  onAdd: (value: string) => void
  onMove: (from: number, to: number) => void
  onRemove: (index: number) => void
  onRename: (index: number, value: string) => void
  onToggle: (index: number) => void
}

export function GoalList({ isEditing, items, onAdd, onMove, onRemove, onRename, onToggle }: GoalListProps) {
  const register = useFlip()
  const { drag, grab, grabbed } = useDragReorder(onMove, items.length)
  const seen = new Map<string, number>()
  return (
    <ul className={`list ${grabbed === undefined ? '' : 'is-dragging'}`} onPointerMove={drag}>
      {items.map((item, index) => {
        // titles can be duplicated, so the key also counts previous occurrences
        const occurrence = seen.get(item.title) ?? 0
        seen.set(item.title, occurrence + 1)
        const key = `${item.title}-${occurrence}`
        return (
          <li className={grabbed === index ? 'dragging' : ''} key={key} ref={register(key)}>
            <GoalRow index={index} isEditing={isEditing} item={item} onGrab={grab} onMove={onMove} onRemove={onRemove} onRename={onRename} onToggle={onToggle} />
          </li>
        )
      })}
      {/* always there, to keep the list as tall in both modes and avoid shifting the goals when switching */}
      <li aria-hidden={!isEditing} className={`new-row ${isEditing ? '' : 'invisible'}`} inert={!isEditing}>
        <div className="item editing">
          <EditableText key={items.length} label="New goal" onCommit={onAdd} placeholder="add something…" value="" />
        </div>
      </li>
    </ul>
  )
}
