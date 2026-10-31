import { render } from '@testing-library/react'
import { useRef } from 'react'
import { useFlip } from './use-flip'

function List({ isEnabled, keys }: Readonly<{ isEnabled: boolean; keys: string[] }>) {
  const list = useRef<HTMLUListElement>(null)
  useFlip(list, keys.join('|'), isEnabled)
  return (
    <ul ref={list}>
      {keys.map(key => (
        <li data-flip={key} key={key} />
      ))}
      <li />
    </ul>
  )
}

const animate = vi.fn<(keyframes: unknown, options: unknown) => void>()
// happy-dom has no layout : a goal is placed by its rank in the last order shown, 10px per goal
let placed: string[] = []

function mock(reduced: boolean) {
  vi.stubGlobal('matchMedia', () => ({ matches: reduced }))
  Object.defineProperty(HTMLElement.prototype, 'offsetTop', {
    configurable: true,
    get(this: HTMLElement) {
      return placed.indexOf(this.dataset.flip ?? '') * 10
    },
  })
  Object.defineProperty(HTMLElement.prototype, 'animate', { configurable: true, value: animate })
  animate.mockClear()
}

function show(keys: string[], isEnabled = true) {
  placed = keys
  return <List isEnabled={isEnabled} keys={keys} />
}

describe('useFlip', () => {
  it('useFlip A the goals that changed place slide from where they were', () => {
    mock(false)
    const { rerender } = render(show(['a', 'b', 'c']))
    expect(animate).not.toHaveBeenCalled()
    rerender(show(['b', 'c', 'a']))
    expect(animate).toHaveBeenCalledTimes(3)
    expect(animate).toHaveBeenCalledWith([{ transform: 'translateY(-20px)' }, { transform: 'translateY(0)' }], expect.anything())
  })

  it('useFlip B nothing moves without a new order, when disabled or with reduced motion', () => {
    mock(false)
    const { rerender } = render(show(['a', 'b']))
    rerender(show(['a', 'b']))
    rerender(show(['b', 'a'], false))
    expect(animate).not.toHaveBeenCalled()
    mock(true)
    rerender(show(['a', 'b']))
    expect(animate).not.toHaveBeenCalled()
  })

  it('useFlip C a new goal does not slide', () => {
    mock(false)
    const { rerender } = render(show(['a']))
    rerender(show(['a', 'b']))
    expect(animate).not.toHaveBeenCalled()
  })
})
