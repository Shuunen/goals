import { useEffect, useState } from 'react'
import { toastDuration, type ToastData } from '../hooks/use-toast'

type ToastProps = { onDismiss: () => void; toast: ToastData | undefined }

// the area is always mounted, so screen readers announce what appears in it
export function Toast({ onDismiss, toast }: Readonly<ToastProps>) {
  const [isPaused, setIsPaused] = useState(false)
  const id = toast?.id
  const duration = toast?.duration ?? toastDuration

  // each toast gets its full time, paused while hovered or focused
  useEffect(() => {
    if (id === undefined || isPaused) return undefined
    const timer = setTimeout(() => {
      toast?.onExpire?.()
      onDismiss()
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, id, isPaused, onDismiss, toast])

  const act = () => {
    toast?.onAction?.()
    onDismiss()
  }

  return (
    <div aria-live="polite" className="toast-area" role="status">
      {toast ? (
        <div className="toast" key={toast.id} onBlur={() => setIsPaused(false)} onFocus={() => setIsPaused(true)} onPointerEnter={() => setIsPaused(true)} onPointerLeave={() => setIsPaused(false)}>
          <span>{toast.message}</span>
          {toast.actionLabel ? (
            <button className="toast-action" onClick={act} type="button">
              {toast.actionLabel}
            </button>
          ) : undefined}
        </div>
      ) : undefined}
    </div>
  )
}
