import { useEffect, useSyncExternalStore } from 'react'
import { usePreference } from './use-preference'

// "auto" follows the system : light is paper, dark is dark
export const themes = ['paper', 'dark', 'ocean', 'sunset', 'forest', 'rose', 'auto'] as const
export type Theme = (typeof themes)[number]

const darkQuery = '(prefers-color-scheme: dark)'

function subscribeToSystem(onChange: () => void) {
  const query = globalThis.matchMedia(darkQuery)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

const isSystemDark = () => globalThis.matchMedia(darkQuery).matches

function resolveTheme(theme: Theme, isDark: boolean) {
  if (theme !== 'auto') return theme
  return isDark ? 'dark' : 'paper'
}

export function useTheme() {
  const [theme, changeTheme] = usePreference('theme', themes)
  const isDark = useSyncExternalStore(subscribeToSystem, isSystemDark)

  // the page wears the resolved theme, the hash & the settings keep "auto"
  // the installed PWA colors its status bar & title bar from the theme-color tag, so it follows the page background too
  useEffect(() => {
    document.documentElement.dataset.theme = resolveTheme(theme, isDark)
    const background = globalThis.getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()
    if (background.length > 0) document.querySelector('meta[name="theme-color"]')?.setAttribute('content', background)
  }, [isDark, theme])

  return { changeTheme, theme }
}
