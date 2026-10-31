import { useEffect, useEffectEvent } from 'react'

// an update waits for the user : the toast says so, and only the Reload button lets the new version take over
// oxlint-disable-next-line no-magic-numbers
export const updateToastDuration = 10 * 60 * 1000

const isProduction = import.meta.env.PROD

// registers the offline worker in the built app only, dev mode is left alone
// onUpdate gets the function that applies a waiting update, the page then reloads once on the new version
export function useServiceWorker(onUpdate: (apply: () => void) => void, isEnabled = isProduction) {
  const offerUpdate = useEffectEvent(onUpdate)
  useEffect(() => {
    const container = globalThis.navigator.serviceWorker as ServiceWorkerContainer | undefined
    if (!isEnabled || container === undefined) return undefined
    // the very first worker also takes control, that is not an update : only a page that already had a worker reloads
    const hadController = Boolean(container.controller)
    let isReloading = false
    const onControllerChange = () => {
      if (!hadController || isReloading) return
      isReloading = true
      globalThis.location.reload()
    }
    // a worker is not a window, there is no target origin
    // oxlint-disable-next-line unicorn/require-post-message-target-origin
    const offer = (worker: ServiceWorker) => offerUpdate(() => worker.postMessage('SKIP_WAITING'))
    container.addEventListener('controllerchange', onControllerChange)
    const register = async () => {
      try {
        const registration = await container.register('/sw.js')
        if (registration.waiting && hadController) offer(registration.waiting)
        registration.addEventListener('updatefound', () => {
          const worker = registration.installing
          worker?.addEventListener('statechange', () => {
            if (worker.state === 'installed' && hadController) offer(worker)
          })
        })
      } catch {
        // no worker, no offline : the app works the same online
      }
    }
    void register()
    return () => container.removeEventListener('controllerchange', onControllerChange)
  }, [isEnabled])
}
