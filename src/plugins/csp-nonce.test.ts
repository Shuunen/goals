// oxlint-disable-next-line vitest/prefer-import-in-mock
vi.mock('node:fs', () => {
  const readFileSync = vi.fn<() => string>().mockReturnValue("Content-Security-Policy: script-src 'nonce-abc123'\n")
  return { default: { readFileSync }, readFileSync }
})

const { readFileSync: mockReadFileSync } = await import('node:fs')
const mockedReadFileSync = vi.mocked(mockReadFileSync)

describe('cspNonce plugin', async () => {
  const { cspNonce } = await import('./csp-nonce')

  it('creates a Vite plugin with correct name', () => {
    const plugin = cspNonce()
    expect(plugin.name).toBe('vite-plugin-csp-nonce')
  })

  it('applies only during build', () => {
    const plugin = cspNonce()
    expect(plugin.apply).toBe('build')
  })

  it('enforces post-processing order', () => {
    const plugin = cspNonce()
    expect(plugin.enforce).toBe('post')
  })

  it('injects nonce into script tags in HTML assets', () => {
    const plugin = cspNonce()
    // @ts-expect-error minimal config mock
    if (typeof plugin.configResolved === 'function') plugin.configResolved({ publicDir: '/public' })
    const bundle = { 'index.html': { source: "<html><body><script src='app.js'></script></body></html>", type: 'asset' } }
    // @ts-expect-error minimal options mock
    if (typeof plugin.generateBundle === 'function') plugin.generateBundle({}, bundle)
    expect(bundle['index.html']?.source).toContain('nonce="abc123"')
  })

  it('does not add nonce to script tags that already have one', () => {
    const plugin = cspNonce()
    // @ts-expect-error minimal config mock
    if (typeof plugin.configResolved === 'function') plugin.configResolved({ publicDir: '/public' })
    const original = '<script nonce="existing">'
    const bundle = { 'index.html': { source: original, type: 'asset' } }
    // @ts-expect-error minimal options mock
    if (typeof plugin.generateBundle === 'function') plugin.generateBundle({}, bundle)
    expect(bundle['index.html']?.source).toBe(original)
  })

  it('skips non-HTML assets', () => {
    const plugin = cspNonce()
    // @ts-expect-error minimal config mock
    if (typeof plugin.configResolved === 'function') plugin.configResolved({ publicDir: '/public' })
    const bundle = { 'main.js': { source: "console.log('hi')", type: 'chunk' } }
    const originalSource = bundle['main.js']?.source
    // @ts-expect-error minimal options mock
    if (typeof plugin.generateBundle === 'function') plugin.generateBundle({}, bundle)
    expect(bundle['main.js']?.source).toBe(originalSource)
  })

  it('skips HTML assets with non-string source', () => {
    const plugin = cspNonce()
    // @ts-expect-error minimal config mock
    if (typeof plugin.configResolved === 'function') plugin.configResolved({ publicDir: '/public' })
    const bundle = { 'index.html': { source: new Uint8Array([1, 2, 3]), type: 'asset' } }
    // @ts-expect-error minimal options mock
    if (typeof plugin.generateBundle === 'function') plugin.generateBundle({}, bundle)
    expect(bundle['index.html']?.source).toBeInstanceOf(Uint8Array)
  })

  it('warns and skips injection when _headers has no nonce', () => {
    mockedReadFileSync.mockReturnValueOnce("Content-Security-Policy: script-src 'self'\n")
    const plugin = cspNonce()
    // @ts-expect-error minimal config mock
    if (typeof plugin.configResolved === 'function') plugin.configResolved({ publicDir: '/public' })
    const bundle = { 'index.html': { source: "<script src='app.js'></script>", type: 'asset' } }
    // @ts-expect-error minimal options mock
    if (typeof plugin.generateBundle === 'function') plugin.generateBundle({}, bundle)
    expect(bundle['index.html']?.source).not.toContain('nonce=')
  })

  it('warns and skips injection when _headers cannot be read', () => {
    mockedReadFileSync.mockImplementationOnce(() => {
      throw new Error('ENOENT')
    })
    const plugin = cspNonce()
    // @ts-expect-error minimal config mock
    if (typeof plugin.configResolved === 'function') plugin.configResolved({ publicDir: '/public' })
    const bundle = { 'index.html': { source: "<script src='app.js'></script>", type: 'asset' } }
    // @ts-expect-error minimal options mock
    if (typeof plugin.generateBundle === 'function') plugin.generateBundle({}, bundle)
    expect(bundle['index.html']?.source).not.toContain('nonce=')
  })
})
