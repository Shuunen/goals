import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import vm from 'node:vm'
import type { Plugin } from 'vite'
import { buildServiceWorker, listFiles, offline, versionOf } from './offline'

function makeBuild() {
  const directory = mkdtempSync(path.join(tmpdir(), 'offline-'))
  mkdirSync(path.join(directory, 'assets'))
  writeFileSync(path.join(directory, 'index.html'), '<html></html>')
  writeFileSync(path.join(directory, 'assets', 'app-abc.js'), 'console.log(1)')
  writeFileSync(path.join(directory, 'assets', 'app-abc.js.map'), '{}')
  writeFileSync(path.join(directory, '_headers'), '/*')
  writeFileSync(path.join(directory, 'sw.js'), 'old')
  return directory
}

describe('listFiles', () => {
  it('listFiles A lists the files with slashes, sorted, without the worker, headers & source maps', () => {
    expect(listFiles(makeBuild())).toStrictEqual(['assets/app-abc.js', 'index.html'])
  })
})

describe('versionOf', () => {
  it('versionOf A changes with the content of a file, not otherwise', () => {
    const directory = makeBuild()
    const files = listFiles(directory)
    const before = versionOf(directory, files)
    expect(before).toMatch(/^[\da-f]{10}$/u)
    expect(versionOf(directory, files)).toBe(before)
    writeFileSync(path.join(directory, 'index.html'), '<html>changed</html>')
    expect(versionOf(directory, files)).not.toBe(before)
  })
})

describe('offline plugin', () => {
  it('offline A runs after the build and writes a worker precaching every file', () => {
    const directory = makeBuild()
    const plugin = offline() as Required<Pick<Plugin, 'closeBundle' | 'configResolved'>> & Plugin
    expect(plugin.apply).toBe('build')
    // @ts-expect-error minimal config mock
    plugin.configResolved({ build: { outDir: 'dist' }, root: path.dirname(directory) })
    // the output directory of the mock config is made of the root & outDir
    const out = path.join(path.dirname(directory), 'dist')
    mkdirSync(out, { recursive: true })
    writeFileSync(path.join(out, 'index.html'), '<html></html>')
    // @ts-expect-error called without the rollup this
    plugin.closeBundle()
    const worker = readFileSync(path.join(out, 'sw.js'), 'utf8')
    expect(worker).toContain('"/"')
    expect(worker).toContain('"/index.html"')
  })
})

// a request resolved against the address of the app, like in a browser
class FakeRequest {
  public readonly url: string
  public constructor(url: string) {
    this.url = new URL(url, 'https://app.test').href
  }
}

type Listener = (event: Record<string, unknown>) => void

// the worker runs in a sandbox with fake caches, clients and network
function runWorker(version = 'v1') {
  const listeners = new Map<string, Listener>()
  const stores = new Map<string, Map<string, globalThis.Response>>()
  const caches = {
    delete: vi.fn<(key: string) => Promise<boolean>>(key => Promise.resolve(stores.delete(key))),
    keys: () => Promise.resolve([...stores.keys()]),
    match: (request: Request | string, options?: { ignoreVary?: boolean }) => {
      if (!options?.ignoreVary) return Promise.resolve(undefined)
      const key = typeof request === 'string' ? new URL(request, 'https://app.test').href : request.url
      for (const store of stores.values()) {
        const found = store.get(key)
        if (found) return Promise.resolve(found)
      }
      return Promise.resolve(undefined)
    },
    open: (name: string) => {
      const store = stores.get(name) ?? new Map<string, globalThis.Response>()
      stores.set(name, store)
      return Promise.resolve({
        addAll: (requests: Request[]) => {
          for (const request of requests) store.set(request.url, new globalThis.Response(`cached ${request.url}`))
          return Promise.resolve()
        },
        match: (request: Request, options?: { ignoreVary?: boolean }) => (options?.ignoreVary ? Promise.resolve(store.get(request.url)) : Promise.resolve(undefined)),
        put: (request: Request, response: Response) => {
          store.set(request.url, response)
          return Promise.resolve()
        },
      })
    },
  }
  const self = {
    addEventListener: (type: string, listener: Listener) => listeners.set(type, listener),
    clients: { claim: vi.fn<() => Promise<void>>().mockResolvedValue(undefined) },
    location: { origin: 'https://app.test' },
    skipWaiting: vi.fn<() => void>(),
  }
  const network = vi.fn<(request: Request) => Promise<Response>>()
  vm.runInNewContext(buildServiceWorker(version, ['/', '/assets/a.js']), { Request: FakeRequest, Response: globalThis.Response, URL, caches, fetch: network, self })
  const run = (type: string, event: Record<string, unknown>) => {
    let work: Promise<unknown> = Promise.resolve()
    listeners.get(type)?.({
      ...event,
      respondWith: (promise: Promise<unknown>) => {
        work = promise
      },
      waitUntil: (promise: Promise<unknown>) => {
        work = promise
      },
    })
    return work
  }
  return { caches, network, run, self, stores }
}

// the body of what the worker answered
const get = (url: string, mode = 'cors', method = 'GET') => ({ method, mode, url })

type Run = (type: string, event: Record<string, unknown>) => Promise<unknown>

const fetched = async (run: Run, url: string, mode = 'cors') => ((await run('fetch', { request: get(url, mode) })) as globalThis.Response).text()

describe('service worker', () => {
  it('worker A installs by caching the shell in a cache named after the version, without taking over', async () => {
    const { run, self, stores } = runWorker('v1')
    await run('install', {})
    expect([...(stores.get('goals-v1')?.keys() ?? [])]).toStrictEqual(['https://app.test/', 'https://app.test/assets/a.js'])
    expect(self.skipWaiting).not.toHaveBeenCalled()
  })

  it('worker B waits for the page to accept the update before taking over', async () => {
    const { run, self } = runWorker()
    await run('message', { data: 'nope' })
    expect(self.skipWaiting).not.toHaveBeenCalled()
    await run('message', { data: 'SKIP_WAITING' })
    expect(self.skipWaiting).toHaveBeenCalledOnce()
  })

  it('worker C activating removes the old app caches only, keeps the fonts and takes control', async () => {
    const { caches, run, self, stores } = runWorker('v2')
    for (const name of ['goals-v1', 'goals-v2', 'goals-fonts', 'other']) stores.set(name, new Map())
    await run('activate', {})
    expect(caches.delete).toHaveBeenCalledExactlyOnceWith('goals-v1')
    expect([...stores.keys()]).toStrictEqual(['goals-v2', 'goals-fonts', 'other'])
    expect(self.clients.claim).toHaveBeenCalledOnce()
  })

  it('worker D any navigation opens the cached page, even offline, and the network is the fallback', async () => {
    const { network, run } = runWorker()
    await run('install', {})
    network.mockRejectedValue(new Error('offline'))
    await expect(fetched(run, 'https://app.test/?utm=1', 'navigate')).resolves.toBe('cached https://app.test/')
    const empty = runWorker()
    empty.network.mockResolvedValue(new globalThis.Response('from network'))
    await expect(fetched(empty.run, 'https://app.test/x', 'navigate')).resolves.toBe('from network')
  })

  it('worker E same origin assets come from the cache first, then the network', async () => {
    const { network, run } = runWorker()
    await run('install', {})
    network.mockResolvedValue(new globalThis.Response('from network'))
    await expect(fetched(run, 'https://app.test/assets/a.js')).resolves.toBe('cached https://app.test/assets/a.js')
    await expect(fetched(run, 'https://app.test/assets/b.js')).resolves.toBe('from network')
  })

  it('worker F ignores what is not a GET or not its business', async () => {
    const { network, run } = runWorker()
    const respondWith = vi.fn<() => void>()
    const listener = vi.fn<() => void>()
    await run('fetch', { request: get('https://app.test/', 'cors', 'POST'), respondWith })
    await run('fetch', { request: get('https://elsewhere.test/api') })
    await run('unknown', {})
    listener()
    expect(network).not.toHaveBeenCalled()
  })

  it('worker G the fonts are served from the cache while they refresh, and cached when first fetched', async () => {
    const { network, run, stores } = runWorker()
    network.mockResolvedValue(new globalThis.Response('font css'))
    await expect(fetched(run, 'https://fonts.googleapis.com/css2?family=Lora')).resolves.toBe('font css')
    expect(stores.get('goals-fonts')?.size).toBe(1)
    network.mockResolvedValue(new globalThis.Response('newer css'))
    await expect(fetched(run, 'https://fonts.googleapis.com/css2?family=Lora')).resolves.toBe('font css')
  })

  it('worker H offline, cached fonts still work and the others fail so the system fonts take over', async () => {
    const { network, run } = runWorker()
    network.mockResolvedValueOnce(new globalThis.Response('woff'))
    await run('fetch', { request: get('https://fonts.gstatic.com/s/lora.woff2') })
    network.mockRejectedValue(new Error('offline'))
    await expect(fetched(run, 'https://fonts.gstatic.com/s/lora.woff2')).resolves.toBe('woff')
    await expect(run('fetch', { request: get('https://fonts.gstatic.com/s/other.woff2') })).rejects.toThrow('offline')
  })

  it('worker I a failed font answer is not cached', async () => {
    const { network, run, stores } = runWorker()
    network.mockResolvedValue(new globalThis.Response('nope', { status: 500 }))
    await run('fetch', { request: get('https://fonts.googleapis.com/css2?family=Bad') })
    expect(stores.get('goals-fonts')?.size).toBe(0)
  })
})
