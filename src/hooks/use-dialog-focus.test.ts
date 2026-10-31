import { renderHook } from '@testing-library/react'
import { useDialogFocus } from './use-dialog-focus'

describe('useDialogFocus', () => {
  it('useDialogFocus A an opener that cannot take the focus back is left alone', () => {
    document.body.insertAdjacentHTML('beforeend', '<svg id="opener" tabindex="0"></svg>')
    document.querySelector<SVGElement>('#opener')?.focus()
    const { rerender } = renderHook(({ isOpen }) => useDialogFocus(isOpen, () => undefined), { initialProps: { isOpen: true } })
    expect(() => rerender({ isOpen: false })).not.toThrow()
  })
})
