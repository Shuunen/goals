import { useCallback, useEffect, useState } from 'react'
import { hashToData, writeHashSetting } from '../utils/hash.utils'

// a choice among a fixed list of options, kept in the url & remembered in the browser, applied as a data attribute on the page
export function usePreference<Option extends string>(name: string, options: readonly Option[]) {
  const storageKey = `goals-${name}`
  const [value, setValue] = useState(() => {
    // a shared link wins over what this browser remembers
    const wanted = hashToData(document.location.hash).settings[name] ?? localStorage.getItem(storageKey)
    return options.find(option => option === wanted) ?? options[0]
  })

  useEffect(() => {
    document.documentElement.dataset[name] = value
    // the url only gets the setting when it matters : a shared link must carry it, but a default one stays clean
    const inUrl = hashToData(document.location.hash).settings[name]
    if (inUrl !== value && (inUrl !== undefined || value !== options[0])) writeHashSetting(name, value)
  }, [name, options, value])

  const change = useCallback(
    (next: Option) => {
      localStorage.setItem(storageKey, next)
      setValue(next)
    },
    [storageKey],
  )

  return [value, change] as const
}
