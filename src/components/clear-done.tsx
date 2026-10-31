type ClearDoneProps = { count: number; isEditing: boolean; onClear: () => void }

// below the list and there whenever something is done, like the add row, so the goals never move when switching modes
export function ClearDone({ count, isEditing, onClear }: Readonly<ClearDoneProps>) {
  if (count === 0) return undefined
  return (
    <button aria-hidden={!isEditing} className={`clear-done ${isEditing ? '' : 'invisible'}`} inert={!isEditing} onClick={onClear} type="button">
      Clear done ({count})
    </button>
  )
}
