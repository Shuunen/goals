import { useRef } from 'react'
import type { Item } from '../models/item.model'
import { AddButton } from './add-button'
import { EditableText } from './editable-text'

type AddRowProps = { isEditing: boolean; onAdd: (value: string) => void; onAddMany: (items: Item[]) => void }

// only there while editing, so the list is exactly as tall as its goals the rest of the time
export function AddRow({ isEditing, onAdd, onAddMany }: Readonly<AddRowProps>) {
  const field = useRef<HTMLTextAreaElement>(null)
  if (!isEditing) return undefined
  return (
    <li className="new-row">
      <div className="item editing">
        <EditableText label="New goal" onCommit={onAdd} onPasteItems={onAddMany} placeholder="add something…" ref={field} resetOnCommit value="" />
        <AddButton field={field} />
      </div>
    </li>
  )
}
