import { useEffect, useRef, useState } from 'react'
import { isUrlLong } from '../utils/url.utils'

const copiedDuration = 2000

type ShareSectionProps = { title: string; url: string }

// copy the link, or share it where the device can, & say how long it is : very long links get cut by some apps
export function ShareSection({ title, url }: Readonly<ShareSectionProps>) {
  const [status, setStatus] = useState<'copied' | 'failed' | 'idle'>('idle')
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const field = useRef<HTMLInputElement>(null)
  useEffect(() => () => clearTimeout(timer.current), [])
  // no clipboard (insecure context, permission) : the link is shown selected, ready to be copied by hand
  useEffect(() => {
    if (status === 'failed') field.current?.select()
  }, [status])

  const copy = async () => {
    try {
      await globalThis.navigator.clipboard.writeText(document.location.href)
      setStatus('copied')
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setStatus('idle'), copiedDuration)
    } catch {
      setStatus('failed')
    }
  }
  // closing the share sheet rejects, it is not an error
  const share = async () => {
    try {
      await globalThis.navigator.share({ title, url: document.location.href })
    } catch {
      // nothing to do
    }
  }

  return (
    <fieldset className="list-actions share">
      <legend>Share</legend>
      <button onClick={copy} type="button">
        Copy link
      </button>
      {typeof globalThis.navigator.share === 'function' ? (
        <button onClick={share} type="button">
          Share
        </button>
      ) : undefined}
      <span aria-live="polite" className="share-status">
        {status === 'copied' ? 'Copied' : ''}
      </span>
      {status === 'failed' ? <input aria-label="Link to copy" className="share-link" readOnly ref={field} value={document.location.href} /> : undefined}
      <small className={isUrlLong(url.length) ? 'share-length long' : 'share-length'}>
        {url.length} characters{isUrlLong(url.length) ? ', some apps may cut such a long link' : ''}
      </small>
    </fieldset>
  )
}
