import { nbPercentMax } from 'shuutils'

type ProgressBarProps = { done: number; total: number }

// a thin accent bar under the title : no number, the screen reader gets the count
// nothing left to track once every goal is done, so the bar goes away
export function ProgressBar({ done, total }: Readonly<ProgressBarProps>) {
  if (total === 0 || done === total) return undefined
  return (
    <div className="progress-wrap">
      <div aria-label="Goals done" aria-valuemax={total} aria-valuemin={0} aria-valuenow={done} aria-valuetext={`${done} of ${total} done`} className="progress" role="progressbar">
        <div className="progress-fill" style={{ width: `${(done / total) * nbPercentMax}%` }} />
      </div>
    </div>
  )
}
