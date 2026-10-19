import { useState } from 'react'
import { TrashIcon } from './trash-icon'

type RemoveButtonProps = {
  onRemove: () => void
  title: string
}

// the first click only asks for a confirmation, in place, the second one removes
export function RemoveButton({ onRemove, title }: RemoveButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false)
  const cancel = () => setIsConfirming(false)
  return (
    <button
      aria-label={isConfirming ? `Confirm removing ${title}` : `Remove ${title}`}
      className={`icon-button remove ${isConfirming ? 'confirming' : ''}`}
      onBlur={cancel}
      onClick={isConfirming ? onRemove : () => setIsConfirming(true)}
      onPointerLeave={cancel}
      type="button"
    >
      <TrashIcon />
      {isConfirming && 'Delete?'}
    </button>
  )
}
