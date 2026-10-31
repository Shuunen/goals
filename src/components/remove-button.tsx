import { TrashIcon } from './trash-icon'

type RemoveButtonProps = {
  onRemove: () => void
  title: string
}

// one click removes, the toast that follows gives it back
export function RemoveButton({ onRemove, title }: Readonly<RemoveButtonProps>) {
  return (
    <button aria-label={`Remove ${title}`} className="icon-button remove" onClick={onRemove} type="button">
      <TrashIcon />
    </button>
  )
}
