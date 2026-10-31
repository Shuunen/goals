import { closestCenter, DndContext, DragOverlay, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core'
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers'
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useMemo, useRef, useState } from 'react'
import { useFlip } from '../hooks/use-flip'
import type { Item } from '../models/item.model'
import { AddRow } from './add-row'
import { GoalRow } from './goal-row'
import { SortableGoal } from './sortable-goal'

type GoalListProps = {
  isEditing: boolean
  items: Item[]
  onAdd: (value: string) => void
  onAddMany: (items: Item[]) => void
  onMove: (from: number, to: number) => void
  onRemove: (index: number) => void
  onRename: (index: number, value: string) => void
  onToggle: (index: number) => void
}

// a few pixels of travel before a drag starts, so a plain tap on the handle never moves anything
const dragDistance = 4
const modifiers = [restrictToVerticalAxis, restrictToWindowEdges]

export function GoalList({ isEditing, items, onAdd, onAddMany, onMove, onRemove, onRename, onToggle }: GoalListProps) {
  const [grabbed, setGrabbed] = useState<string>()
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: dragDistance } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))
  const keys = useMemo(() => {
    const seen = new Map<string, number>()
    // titles can be duplicated, so the key also counts previous occurrences
    return items.map(item => {
      const occurrence = seen.get(item.title) ?? 0
      seen.set(item.title, occurrence + 1)
      return `${item.title}-${occurrence}`
    })
  }, [items])
  const list = useRef<HTMLUListElement>(null)
  useFlip(list, keys.join('|'), !isEditing)
  const grabbedIndex = grabbed === undefined ? -1 : keys.indexOf(grabbed)

  const onDragStart = (event: DragStartEvent) => setGrabbed(String(event.active.id))
  // moving to the same spot, or to nothing (-1), is ignored by onMove
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setGrabbed(undefined)
    onMove(keys.indexOf(String(active.id)), keys.indexOf(String(over?.id)))
  }

  return (
    <DndContext collisionDetection={closestCenter} modifiers={modifiers} onDragCancel={() => setGrabbed(undefined)} onDragEnd={onDragEnd} onDragStart={onDragStart} sensors={sensors}>
      <SortableContext items={keys} strategy={verticalListSortingStrategy}>
        <ul className={`list ${grabbed === undefined ? '' : 'is-dragging'}`} ref={list}>
          {items.map((item, index) => (
            <SortableGoal id={keys[index]} index={index} isEditing={isEditing} item={item} key={keys[index]} onRemove={onRemove} onRename={onRename} onToggle={onToggle} />
          ))}
          <AddRow isEditing={isEditing} onAdd={onAdd} onAddMany={onAddMany} />
        </ul>
      </SortableContext>
      {/* the card follows the pointer, while its slot in the list stays open as the place where it will land */}
      <DragOverlay modifiers={modifiers}>
        {grabbedIndex === -1 ? undefined : (
          <div className="goal-overlay">
            <GoalRow index={grabbedIndex} isEditing item={items[grabbedIndex]} onRemove={onRemove} onRename={onRename} onToggle={onToggle} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
