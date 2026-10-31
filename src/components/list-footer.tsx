import { ClearDone } from './clear-done'

type ListFooterProps = { doneCount: number; isEditing: boolean; onClear: () => void; onReset: () => void; total: number }

// below the list : clear the done goals while editing, start over once every goal is done
export function ListFooter({ doneCount, isEditing, onClear, onReset, total }: Readonly<ListFooterProps>) {
  return (
    <>
      <ClearDone count={doneCount} isEditing={isEditing} onClear={onClear} />
      {total > 0 && doneCount === total ? (
        <button className="reset-all" onClick={onReset} type="button">
          Reset all
        </button>
      ) : undefined}
    </>
  )
}
