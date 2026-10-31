import { useEffect, useEffectEvent, useRef } from 'react'

// modal for real : the focus moves into the dialog when it opens, Escape closes it, and the focus goes back to what opened it
export function useDialogFocus(isOpen: boolean, onClose: () => void) {
  const dialog = useRef<HTMLDivElement>(null)
  const close = useEffectEvent(onClose)
  useEffect(() => {
    if (!isOpen) return undefined
    const opener = document.activeElement
    dialog.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      if (opener instanceof HTMLElement) opener.focus()
    }
  }, [isOpen])
  return dialog
}
