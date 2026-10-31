import { useEffect } from 'react'
import { usePreference } from './use-preference'

export const themes = ['paper', 'dark', 'ocean', 'sunset', 'forest', 'rose'] as const
export type Theme = (typeof themes)[number]

export function useTheme() {
  const [theme, changeTheme] = usePreference('theme', themes)

  // the installed PWA colors its status bar & title bar from this tag, so it follows the page background of the chosen theme
  useEffect(() => {
    const background = globalThis.getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()
    if (background.length > 0) document.querySelector('meta[name="theme-color"]')?.setAttribute('content', background)
    // oxlint-disable-next-line react/exhaustive-effect-dependencies -- the theme is the trigger, the color is read from the page
  }, [theme])

  return { changeTheme, theme }
}
