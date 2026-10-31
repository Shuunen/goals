import { useCallback, useEffect } from 'react'
import { nbPercentMax } from 'shuutils'
import { usePreference } from './use-preference'

// zoom levels in percent, around the default one : a few gaps smaller, a few gaps bigger, never down to zero
const gap = 10
const stepsEachSide = 10
const sizes = Array.from({ length: stepsEachSide + stepsEachSide + 1 }, (_unused, index) => nbPercentMax + (index - stepsEachSide) * gap)
  .filter(size => size > 0)
  .map(String)
export type Size = string

export function useSize() {
  const [size, changeSize] = usePreference('size', sizes, String(nbPercentMax))
  const index = sizes.indexOf(size)

  // every length of the app is in rem, so scaling the root font size scales the text, line heights & icons together
  useEffect(() => {
    document.documentElement.style.setProperty('--zoom', String(Number(size) / nbPercentMax))
  }, [size])

  const smaller = useCallback(() => changeSize(sizes[index - 1] ?? size), [changeSize, index, size])
  const larger = useCallback(() => changeSize(sizes[index + 1] ?? size), [changeSize, index, size])
  return { canGrow: index < sizes.length - 1, canShrink: index > 0, larger, size, smaller }
}
