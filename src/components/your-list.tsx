import type { Item } from '../models/item.model'
import { ClearEverything } from './clear-everything'
import { ExportActions } from './export-actions'
import { ImportActions } from './import-actions'

export type YourListProps = {
  canReset: boolean
  items: Item[]
  onClear: () => void
  onReplace: (items: Item[], title?: string) => void
  onReset: () => void
  title: string
}

// everything about the list as a whole : uncheck it, take it away, bring one in, start over
export function YourList({ canReset, items, onClear, onReplace, onReset, title }: Readonly<YourListProps>) {
  return (
    <fieldset className="list-actions your-list">
      <legend>Your list</legend>
      <div className="list-group">
        <button disabled={!canReset} onClick={onReset} type="button">
          Reset all
        </button>
      </div>
      <ExportActions items={items} title={title} />
      <ImportActions onReplace={onReplace} />
      <ClearEverything onClear={onClear} />
    </fieldset>
  )
}
