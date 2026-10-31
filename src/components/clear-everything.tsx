import { useState } from 'react'

type ClearEverythingProps = { onClear: () => void }

// two steps, in place : this one wipes the settings too & cannot be undone
export function ClearEverything({ onClear }: Readonly<ClearEverythingProps>) {
  const [isConfirming, setIsConfirming] = useState(false)
  if (!isConfirming)
    return (
      <div className="list-group">
        <button className="danger" onClick={() => setIsConfirming(true)} type="button">
          Clear everything
        </button>
      </div>
    )
  return (
    <div className="list-group">
      <span role="alert">Clear everything? This empties your list and resets the settings, it cannot be undone.</span>
      <button className="danger" onClick={onClear} type="button">
        Yes, clear
      </button>
      <button onClick={() => setIsConfirming(false)} type="button">
        Cancel
      </button>
    </div>
  )
}
