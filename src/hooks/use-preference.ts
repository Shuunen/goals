import { useCallback, useEffect, useState } from 'react'
import { storagePrefix } from '../utils/defaults.utils'
import { hashToData, writeHashSetting } from '../utils/hash.utils'

// a choice among a fixed list of options, kept in the url & remembered in the browser, applied as a data attribute on the page
// the default is the first option, unless another one is given
export function usePreference<Option extends string>(name: string, options: readonly Option[], defaultOption?: Option) {
  const fallback = defaultOption ?? options[0]
  const storageKey = `${storagePrefix}${name}`
  const [value, setValue] = useState(() => {
    // a shared link wins over what this browser remembers
    const wanted = hashToData(document.location.hash).settings[name] ?? localStorage.getItem(storageKey)
    return options.find(option => option === wanted) ?? fallback
  })

  useEffect(() => {
    document.documentElement.dataset[name] = value
    // the url only gets the setting when it matters : a shared link must carry it, but a default one stays clean
    const inUrl = hashToData(document.location.hash).settings[name]
    if (inUrl !== value && (inUrl !== undefined || value !== fallback)) writeHashSetting(name, value)
  }, [fallback, name, value])

  // the hash can change from outside, like a pasted url or a back button
  useEffect(() => {
    const onHashChange = () => {
      const wanted = hashToData(document.location.hash).settings[name]
      const option = options.find(candidate => candidate === wanted)
      if (option !== undefined) setValue(option)
    }
    globalThis.addEventListener('hashchange', onHashChange)
    return () => globalThis.removeEventListener('hashchange', onHashChange)
  }, [name, options])

  const change = useCallback(
    (next: Option) => {
      localStorage.setItem(storageKey, next)
      setValue(next)
    },
    [storageKey],
  )

  return [value, change] as const
}
