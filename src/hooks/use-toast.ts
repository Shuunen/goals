import { useCallback, useState } from 'react'

export const toastDuration = 5000

export type ToastOptions = {
  actionLabel?: string
  duration?: number
  message: string
  onAction?: () => void
  onExpire?: () => void
}

export type ToastData = ToastOptions & { id: number }

// one toast at a time : a newer one replaces the visible one
export function useToast() {
  const [toast, setToast] = useState<ToastData | undefined>()
  const showToast = useCallback((options: ToastOptions) => setToast(previous => ({ ...options, id: (previous?.id ?? 0) + 1 })), [])
  const dismissToast = useCallback(() => setToast(undefined), [])
  return { dismissToast, showToast, toast }
}
