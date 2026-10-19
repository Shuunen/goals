import { useCallback, useState } from 'react'
import { usePreference } from './use-preference'

export const fonts = ['indie-flower', 'caveat', 'inter', 'lora', 'jetbrains-mono', 'space-grotesk'] as const
export type Font = (typeof fonts)[number]

export const fontLabels: Record<Font, string> = {
  caveat: 'caveat',
  'indie-flower': 'indie',
  inter: 'inter',
  'jetbrains-mono': 'mono',
  lora: 'lora',
  'space-grotesk': 'grotesk',
}

// one picker, two targets : the title and the goal labels each keep their own font, picked from the same
// grid. Clicking a swatch alternates which one it sets, starting with the title, both default to the same font
export function useFont() {
  const [titleFont, changeTitleFont] = usePreference('titleFont', fonts)
  const [labelFont, changeLabelFont] = usePreference('labelFont', fonts)
  const [nextTarget, setNextTarget] = useState<'label' | 'title'>('title')
  const pickFont = useCallback(
    (font: Font) => {
      if (nextTarget === 'title') changeTitleFont(font)
      else changeLabelFont(font)
      setNextTarget(previous => (previous === 'title' ? 'label' : 'title'))
    },
    [changeLabelFont, changeTitleFont, nextTarget],
  )
  return { labelFont, pickFont, titleFont }
}
