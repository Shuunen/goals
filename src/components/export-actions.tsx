import { useEffect, useRef } from 'react'
import { useCopy } from '../hooks/use-copy'
import type { Item } from '../models/item.model'
import { downloadFile } from '../utils/download.utils'
import { fileName, toJson, toMarkdown } from '../utils/goals-file.utils'

type ExportActionsProps = { items: Item[]; title: string }

// the list as a json file, or as a Markdown checklist in the clipboard
export function ExportActions({ items, title }: Readonly<ExportActionsProps>) {
  const { copy, status } = useCopy()
  const markdown = toMarkdown(title, items)
  const field = useRef<HTMLTextAreaElement>(null)
  // no clipboard : the text is shown selected, ready to be copied by hand
  useEffect(() => {
    if (status === 'failed') field.current?.select()
  }, [status])
  return (
    <div className="list-group">
      <button onClick={() => downloadFile(fileName(title), toJson(title, items))} type="button">
        Download JSON
      </button>
      <button onClick={() => copy(markdown)} type="button">
        Copy as text
      </button>
      <span aria-live="polite" className="share-status">
        {status === 'copied' ? 'Copied' : ''}
      </span>
      {status === 'failed' ? <textarea aria-label="Text to copy" className="share-link" readOnly ref={field} rows={4} value={markdown} /> : undefined}
    </div>
  )
}
