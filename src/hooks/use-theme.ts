import { usePreference } from './use-preference'

export const themes = ['paper', 'dark', 'ocean', 'sunset', 'forest', 'rose'] as const
export type Theme = (typeof themes)[number]

export function useTheme() {
  const [theme, changeTheme] = usePreference('theme', themes)
  return { changeTheme, theme }
}
