type ClearDoneProps = { count: number; isEditing: boolean; onClear: () => void }

// below the list while editing and something is done, gone the rest of the time so it leaves no gap
export function ClearDone({ count, isEditing, onClear }: Readonly<ClearDoneProps>) {
  if (count === 0 || !isEditing) return undefined
  return (
    <button className="clear-done" onClick={onClear} type="button">
      Clear done ({count})
    </button>
  )
}
