// oxlint-disable import/no-nodejs-modules
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'

// what is not worth caching : the worker itself, the netlify headers, the source maps
const versionLength = 10

const ignored = /(?:^|\/)(?:sw\.js|_headers)$|\.map$/u

export function listFiles(directory: string, root = directory): string[] {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap(entry => (entry.isDirectory() ? listFiles(path.join(directory, entry.name), root) : [path.relative(root, path.join(directory, entry.name)).split(path.sep).join('/')]))
    .filter(file => !ignored.test(file))
    .toSorted()
}

// a new build means a new version, so a new cache & the update prompt
export function versionOf(directory: string, files: string[]) {
  const hash = createHash('sha256')
  for (const file of files) hash.update(file).update(readFileSync(path.join(directory, file)))
  return hash.digest('hex').slice(0, versionLength)
}

// the part of the worker that does not depend on the build
const workerBody = `const fontCache = 'goals-fonts'
// scripts & styles are asked in cors mode, with an Origin header that a server may declare in Vary : the cached copy is right all the same
const matching = { ignoreVary: true }

self.addEventListener('install', event => {
  event.waitUntil(caches.open(cacheName).then(cache => cache.addAll(urls.map(url => new Request(url, { cache: 'reload' })))))
})

// no skipWaiting here : the page asks for it once the user accepted the update, so nobody gets a half updated app
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting()
})

self.addEventListener('activate', event => {
  const isOld = key => key.startsWith('goals-') && key !== cacheName && key !== fontCache
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(isOld).map(key => caches.delete(key)))).then(() => self.clients.claim()))
})

const isFont = url => url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com'

async function staleWhileRevalidate(request) {
  const cache = await caches.open(fontCache)
  const cached = await cache.match(request, matching)
  const refresh = fetch(request).then(response => {
    if (response.ok || response.type === 'opaque') cache.put(request, response.clone())
    return response
  })
  if (!cached) return refresh
  refresh.catch(() => undefined)
  return cached
}

// any address of the app opens the cached page, the goals are in the hash anyway
async function page(request) {
  return (await caches.match('/', matching)) ?? fetch(request)
}

async function cacheFirst(request) {
  return (await caches.match(request, matching)) ?? fetch(request)
}

self.addEventListener('fetch', event => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (isFont(url)) event.respondWith(staleWhileRevalidate(request))
  else if (url.origin === self.location.origin) event.respondWith(request.mode === 'navigate' ? page(request) : cacheFirst(request))
})
`

// the whole app shell is cached at install, so it opens offline : the page, the built assets, the icons
// the Google fonts are cached while they are used, without them the page falls back to the system fonts
export function buildServiceWorker(version: string, urls: string[]) {
  return `const cacheName = ${JSON.stringify(`goals-${version}`)}
const urls = ${JSON.stringify(urls)}
${workerBody}`
}

export function offline(): Plugin {
  let outDirectory = ''
  return {
    apply: 'build',
    closeBundle() {
      // after every other plugin, so the list & the version are those of the final files
      const files = listFiles(outDirectory)
      const urls = ['/', ...files.map(file => `/${file}`)]
      writeFileSync(path.join(outDirectory, 'sw.js'), buildServiceWorker(versionOf(outDirectory, files), urls))
      console.log(`offline: service worker precaches ${urls.length} files`)
    },
    configResolved(config) {
      outDirectory = path.resolve(config.root, config.build.outDir)
    },
    name: 'vite-plugin-offline',
  }
}
