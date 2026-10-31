import { useCallback, useEffect } from 'react'
import { usePreference } from './use-preference'

// zoom levels in percent, from the smallest to the biggest
const sizes = ['75', '90', '100', '125', '150', '175'] as const
export type Size = (typeof sizes)[number]

const defaultSize: Size = '100'
const percent = 100

export function useSize() {
  const [size, changeSize] = usePreference('size', sizes, defaultSize)
  const index = sizes.indexOf(size)

  // every length of the app is in rem, so scaling the root font size scales the text, line heights & icons together
  useEffect(() => {
    document.documentElement.style.setProperty('--zoom', String(Number(size) / percent))
  }, [size])

  const smaller = useCallback(() => changeSize(sizes[index - 1] ?? size), [changeSize, index, size])
  const larger = useCallback(() => changeSize(sizes[index + 1] ?? size), [changeSize, index, size])
  return { canGrow: index < sizes.length - 1, canShrink: index > 0, larger, size, smaller }
}
