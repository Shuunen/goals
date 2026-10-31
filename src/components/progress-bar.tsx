import { nbPercentMax } from 'shuutils'

type ProgressBarProps = { done: number; total: number }

// a thin accent bar under the title : no number, the screen reader gets the count
export function ProgressBar({ done, total }: Readonly<ProgressBarProps>) {
  if (total === 0) return undefined
  return (
    <div aria-label="Goals done" aria-valuemax={total} aria-valuemin={0} aria-valuenow={done} aria-valuetext={`${done} of ${total} done`} className="progress" role="progressbar">
      <div className="progress-fill" style={{ width: `${(done / total) * nbPercentMax}%` }} />
    </div>
  )
}
