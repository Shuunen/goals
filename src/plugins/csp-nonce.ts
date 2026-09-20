// oxlint-disable import/no-nodejs-modules
import { readFileSync } from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'

function extractNonce(headersContent: string): string | undefined {
  const match = /nonce-(?<nonce>[A-Za-z0-9+/=_-]+)/.exec(headersContent)
  return match?.groups?.nonce
}

function injectNonceIntoHtml(html: string, nonce: string): string {
  return html.replaceAll(/<script\b(?<attrs>[^>]*)>/gu, (_m, attrs: string) => {
    if (/\bnonce=/.test(attrs)) return `<script${attrs}>`
    return `<script${attrs} nonce="${nonce}">`
  })
}

export function cspNonce(): Plugin {
  let nonce: string | undefined = undefined
  return {
    apply: 'build',
    configResolved(config) {
      const headersPath = path.join(config.publicDir, '_headers')
      try {
        const content = readFileSync(headersPath, 'utf8')
        nonce = extractNonce(content)
        if (!nonce) console.warn('csp-nonce: no nonce found in _headers, skipping injection')
      } catch {
        console.warn('csp-nonce: could not read public/_headers, skipping injection')
      }
    },
    enforce: 'post',
    generateBundle(_options, bundle) {
      if (!nonce) return
      for (const [fileName, asset] of Object.entries(bundle)) {
        if (!fileName.endsWith('.html') || asset.type !== 'asset') continue
        if (typeof asset.source !== 'string') continue
        asset.source = injectNonceIntoHtml(asset.source, nonce)
      }
      console.log(`csp-nonce: injected nonce into HTML script tags`)
    },
    name: 'vite-plugin-csp-nonce',
  }
}
