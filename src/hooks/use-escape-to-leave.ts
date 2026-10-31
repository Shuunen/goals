import { useEffect } from 'react'

// where the Escape key already means something else : a field being typed in (it gives its text back), the keyboard drag of a goal (it cancels),
// a button of the toast
function isBusy(event: KeyboardEvent) {
  // there is always an active element once the page is shown, body at least
  // v8 ignore next -- @preserve
  const active = document.activeElement ?? document.body
  const isTyping = ['INPUT', 'TEXTAREA'].includes(active.tagName)
  const isOnToast = Boolean(active.closest('.toast'))
  return event.defaultPrevented || isTyping || isOnToast || document.querySelector('.is-dragging') !== null
}

// Escape leaves the edit mode when nothing else claims it, the settings handle their own Escape
export function useEscapeToLeave(isActive: boolean, onLeave: () => void) {
  useEffect(() => {
    if (!isActive) return undefined
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isBusy(event)) onLeave()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isActive, onLeave])
}
