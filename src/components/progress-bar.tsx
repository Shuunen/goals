import { useEffect, useRef, useState } from 'react'
import { nbPercentMax } from 'shuutils'

type ProgressBarProps = { done: number; isEditing: boolean; total: number }

// a thin accent bar under the title : no number, the screen reader gets the count
// finishing the last goal gives a burst & a glow, never when merely loading a finished list or while editing
export function ProgressBar({ done, isEditing, total }: Readonly<ProgressBarProps>) {
  const isComplete = total > 0 && done === total
  const wasComplete = useRef(isComplete)
  const [isCelebrating, setIsCelebrating] = useState(false)
  useEffect(() => {
    const isJustComplete = isComplete && !wasComplete.current
    wasComplete.current = isComplete
    if (isJustComplete && !isEditing && !globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches) setIsCelebrating(true)
  }, [isComplete, isEditing])
  if (total === 0) return undefined
  return (
    <div className={`progress-wrap ${isCelebrating ? 'celebrate' : ''}`} onAnimationEnd={event => event.animationName === 'glow' && setIsCelebrating(false)}>
      <div aria-label="Goals done" aria-valuemax={total} aria-valuemin={0} aria-valuenow={done} aria-valuetext={`${done} of ${total} done`} className="progress" role="progressbar">
        <div className="progress-fill" style={{ width: `${(done / total) * nbPercentMax}%` }} />
      </div>
    </div>
  )
}
