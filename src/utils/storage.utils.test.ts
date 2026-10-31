import { readStored, removeStoredWithPrefix, writeStored } from './storage.utils'

function blocked(): never {
  throw new Error('the browser memory is blocked')
}

describe('storage utils', () => {
  it('storage utils A read, write and remove by prefix work on the browser memory', () => {
    writeStored('goals-a', '1')
    writeStored('other-a', '2')
    expect(readStored('goals-a')).toBe('1')
    expect(readStored('goals-missing')).toBeNull()
    removeStoredWithPrefix('goals-')
    expect(readStored('goals-a')).toBeNull()
    expect(readStored('other-a')).toBe('2')
    localStorage.clear()
  })

  it('storage utils B a blocked or full browser memory never throws', () => {
    vi.stubGlobal('localStorage', { getItem: blocked, setItem: blocked })
    expect(readStored('goals-a')).toBeUndefined()
    expect(() => writeStored('goals-a', '1')).not.toThrow()
    vi.unstubAllGlobals()
  })

  it('storage utils C a browser memory that cannot even be reached never throws', () => {
    const memory = vi.spyOn(globalThis, 'localStorage', 'get').mockImplementation(blocked)
    expect(readStored('goals-a')).toBeUndefined()
    expect(() => removeStoredWithPrefix('goals-')).not.toThrow()
    memory.mockRestore()
  })
})
