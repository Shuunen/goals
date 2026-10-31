import { useState, type ChangeEvent } from 'react'
import type { Item } from '../models/item.model'
import { maxImportedGoals, parseImport } from '../utils/goals-file.utils'

type ImportActionsProps = { onReplace: (items: Item[], title?: string) => void }

// a file or pasted text becomes the list, after saying how many goals were found : the replacement can be undone
export function ImportActions({ onReplace }: Readonly<ImportActionsProps>) {
  const [text, setText] = useState('')
  const found = parseImport(text)
  const count = found.items.length

  const readFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) setText(await file.text())
    // the same file can be picked again
    event.target.value = ''
  }
  const replace = () => {
    onReplace(found.items, found.title)
    setText('')
  }

  return (
    <div className="list-group import">
      <label className="file-picker">
        Import a file
        <input accept=".json,.md,.txt,application/json,text/plain,text/markdown" onChange={readFile} type="file" />
      </label>
      <textarea aria-label="Paste a list to import" className="share-link" onChange={event => setText(event.target.value)} placeholder="…or paste a list : JSON, a Markdown checklist, one goal per line" rows={3} value={text} />
      {text.trim().length > 0 ? (
        <span aria-live="polite" className="import-count">
          {count === 0 ? 'No goals found' : `${count} goals found${found.isTruncated ? `, only the first ${maxImportedGoals} are kept` : ''}`}
        </span>
      ) : undefined}
      <button disabled={count === 0} onClick={replace} type="button">
        Replace my list
      </button>
    </div>
  )
}
