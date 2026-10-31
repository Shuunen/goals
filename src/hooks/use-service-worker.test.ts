import { renderHook, waitFor } from '@testing-library/react'
import { useServiceWorker } from './use-service-worker'

type Listener = () => void

function fakeWorker(state = 'installed') {
  const listeners = new Map<string, Listener>()
  return { addEventListener: (type: string, listener: Listener) => listeners.set(type, listener), listeners, postMessage: vi.fn<(message: string) => void>(), state }
}

function fakeContainer(controller: object | undefined, registration: { installing?: ReturnType<typeof fakeWorker>; waiting?: ReturnType<typeof fakeWorker> }) {
  const listeners = new Map<string, Listener>()
  const registrationListeners = new Map<string, Listener>()
  const container = {
    addEventListener: (type: string, listener: Listener) => listeners.set(type, listener),
    controller,
    listeners,
    register: vi.fn<(url: string) => Promise<unknown>>().mockResolvedValue({ addEventListener: (type: string, listener: Listener) => registrationListeners.set(type, listener), ...registration }),
    registrationListeners,
    removeEventListener: vi.fn<(type: string) => void>(),
  }
  Object.defineProperty(globalThis.navigator, 'serviceWorker', { configurable: true, value: container })
  return container
}

describe('useServiceWorker', () => {
  it('useServiceWorker A does nothing in dev mode, or without service worker support', () => {
    const container = fakeContainer(undefined, {})
    renderHook(() => useServiceWorker(vi.fn<() => void>(), false))
    expect(container.register).not.toHaveBeenCalled()
    Object.defineProperty(globalThis.navigator, 'serviceWorker', { configurable: true, value: undefined })
    expect(() => renderHook(() => useServiceWorker(vi.fn<() => void>(), true))).not.toThrow()
  })

  it('useServiceWorker B registers the worker, a first visit has nothing to offer or reload', async () => {
    const onUpdate = vi.fn<() => void>()
    const container = fakeContainer(undefined, { waiting: fakeWorker() })
    const reload = vi.spyOn(globalThis.location, 'reload').mockReturnValue(undefined)
    renderHook(() => useServiceWorker(onUpdate, true))
    await waitFor(() => {
      expect(container.register).toHaveBeenCalledExactlyOnceWith('/sw.js')
    })
    container.listeners.get('controllerchange')?.()
    expect(onUpdate).not.toHaveBeenCalled()
    expect(reload).not.toHaveBeenCalled()
    reload.mockRestore()
  })

  it('useServiceWorker C an update already waiting is offered, accepting it asks the worker to take over', async () => {
    const waiting = fakeWorker()
    const onUpdate = vi.fn<(apply: () => void) => void>()
    fakeContainer({}, { waiting })
    renderHook(() => useServiceWorker(onUpdate, true))
    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledOnce()
    })
    onUpdate.mock.calls[0]?.[0]()
    expect(waiting.postMessage).toHaveBeenCalledExactlyOnceWith('SKIP_WAITING')
  })

  it('useServiceWorker D an update found later is offered once it is installed, not before', async () => {
    const installing = fakeWorker('installing')
    const onUpdate = vi.fn<(apply: () => void) => void>()
    const container = fakeContainer({}, { installing })
    renderHook(() => useServiceWorker(onUpdate, true))
    await waitFor(() => {
      expect(container.registrationListeners.has('updatefound')).toBe(true)
    })
    container.registrationListeners.get('updatefound')?.()
    installing.listeners.get('statechange')?.()
    expect(onUpdate).not.toHaveBeenCalled()
    installing.state = 'installed'
    installing.listeners.get('statechange')?.()
    expect(onUpdate).toHaveBeenCalledOnce()
  })

  it('useServiceWorker E an update found without a worker installing does nothing', async () => {
    const container = fakeContainer({}, {})
    renderHook(() => useServiceWorker(vi.fn<() => void>(), true))
    await waitFor(() => {
      expect(container.registrationListeners.has('updatefound')).toBe(true)
    })
    expect(() => container.registrationListeners.get('updatefound')?.()).not.toThrow()
  })

  it('useServiceWorker F the page reloads once when the new worker takes control, and the listener goes on unmount', async () => {
    const reload = vi.spyOn(globalThis.location, 'reload').mockReturnValue(undefined)
    const container = fakeContainer({}, {})
    const { unmount } = renderHook(() => useServiceWorker(vi.fn<() => void>(), true))
    await waitFor(() => {
      expect(container.register).toHaveBeenCalledOnce()
    })
    container.listeners.get('controllerchange')?.()
    container.listeners.get('controllerchange')?.()
    expect(reload).toHaveBeenCalledOnce()
    unmount()
    expect(container.removeEventListener).toHaveBeenCalledOnce()
    reload.mockRestore()
  })

  it('useServiceWorker G a registration that fails leaves the app working', async () => {
    const container = fakeContainer({}, {})
    container.register.mockRejectedValue(new Error('blocked'))
    renderHook(() => useServiceWorker(vi.fn<() => void>(), true))
    await waitFor(() => {
      expect(container.register).toHaveBeenCalledOnce()
    })
  })
})
