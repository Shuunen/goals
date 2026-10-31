import { downloadFile } from './download.utils'

describe('downloadFile', () => {
  it('downloadFile A makes a blob link with the name and clicks it', () => {
    const create = vi.fn<(blob: Blob) => string>().mockReturnValue('blob:fake')
    const revoke = vi.fn<(url: string) => void>()
    Object.assign(URL, { createObjectURL: create, revokeObjectURL: revoke })
    const click = vi.spyOn(HTMLElement.prototype, 'click').mockReturnValue(undefined)
    vi.useFakeTimers()
    downloadFile('goals-a.json', '{"a":1}')
    const [blob] = create.mock.calls[0] ?? []
    expect(blob?.type).toBe('application/json')
    expect(click).toHaveBeenCalledOnce()
    vi.runAllTimers()
    expect(revoke).toHaveBeenCalledExactlyOnceWith('blob:fake')
    vi.useRealTimers()
    click.mockRestore()
  })
})
