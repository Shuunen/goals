import { useRef } from 'react'
import { AddButton } from './add-button'
import { EditableText } from './editable-text'

type AddRowProps = { isEditing: boolean; onAdd: (value: string) => void }

// always there, to keep the list as tall in both modes and avoid shifting the goals when switching
export function AddRow({ isEditing, onAdd }: Readonly<AddRowProps>) {
  const field = useRef<HTMLTextAreaElement>(null)
  return (
    <li aria-hidden={!isEditing} className={`new-row ${isEditing ? '' : 'invisible'}`} inert={!isEditing}>
      <div className="item editing">
        <EditableText label="New goal" onCommit={onAdd} placeholder="add something…" ref={field} resetOnCommit value="" />
        <AddButton field={field} />
      </div>
    </li>
  )
}
