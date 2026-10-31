import { useCallback, useEffect, useRef, useState } from 'react'

const copiedDuration = 2000

// copies a text to the clipboard : 'copied' for 2 seconds, or 'failed' where the clipboard is not available (insecure context, permission)
export function useCopy() {
  const [status, setStatus] = useState<'copied' | 'failed' | 'idle'>('idle')
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])
  const copy = useCallback(async (text: string) => {
    try {
      await globalThis.navigator.clipboard.writeText(text)
      setStatus('copied')
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setStatus('idle'), copiedDuration)
    } catch {
      setStatus('failed')
    }
  }, [])
  return { copy, status }
}
