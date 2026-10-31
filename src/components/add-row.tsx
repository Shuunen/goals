import { useRef } from 'react'
import type { Item } from '../models/item.model'
import { AddButton } from './add-button'
import { EditableText } from './editable-text'

type AddRowProps = { isEditing: boolean; onAdd: (value: string) => void; onAddMany: (items: Item[]) => void }

// always there, to keep the list as tall in both modes and avoid shifting the goals when switching
export function AddRow({ isEditing, onAdd, onAddMany }: Readonly<AddRowProps>) {
  const field = useRef<HTMLTextAreaElement>(null)
  return (
    <li aria-hidden={!isEditing} className={`new-row ${isEditing ? '' : 'invisible'}`} inert={!isEditing}>
      <div className="item editing">
        <EditableText label="New goal" onCommit={onAdd} onPasteItems={onAddMany} placeholder="add something…" ref={field} resetOnCommit value="" />
        <AddButton field={field} />
      </div>
    </li>
  )
}
