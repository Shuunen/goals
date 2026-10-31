import { useEffect, useSyncExternalStore } from 'react'
import { usePreference } from './use-preference'

// the 6 looks of the app ; until one is chosen, the page follows the system : light is paper, dark is dracula
export const themes = ['paper', 'dracula', 'ocean', 'sunset', 'forest', 'rose'] as const
export type Theme = (typeof themes)[number]

// dracula was called dark
const aliases = { dark: 'dracula' } as const

const darkQuery = '(prefers-color-scheme: dark)'

function subscribeToSystem(onChange: () => void) {
  const query = globalThis.matchMedia(darkQuery)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

const isSystemDark = () => globalThis.matchMedia(darkQuery).matches

function resolveTheme(theme: Theme, isChosen: boolean, isDark: boolean) {
  if (isChosen) return theme
  return isDark ? 'dracula' : 'paper'
}

export function useTheme() {
  const [chosen, changeTheme, isChosen] = usePreference('theme', themes, { aliases, keepsChoice: true })
  const isDark = useSyncExternalStore(subscribeToSystem, isSystemDark)

  const theme = resolveTheme(chosen, isChosen, isDark)

  // the page wears the chosen theme, or the one of the system when nothing was chosen
  // the installed PWA colors its status bar & title bar from the theme-color tag, so it follows the page background too
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    const background = globalThis.getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()
    if (background.length > 0) document.querySelector('meta[name="theme-color"]')?.setAttribute('content', background)
  }, [theme])

  return { changeTheme, theme }
}
