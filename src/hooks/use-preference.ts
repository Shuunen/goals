import { useCallback, useEffect, useState } from 'react'
import { storagePrefix } from '../utils/defaults.utils'
import { hashToData, writeHashSetting } from '../utils/hash.utils'

type Extras<Option extends string> = {
  // old names of options, so links & browsers that kept one still work
  aliases?: Record<string, Option>
  // the default is the first option, unless another one is given
  defaultOption?: Option
  // a default that was picked on purpose goes in the url too, because the default itself may depend on something else
  keepsChoice?: boolean
}

function findOption<Option extends string>(options: readonly Option[], aliases: Record<string, Option> | undefined, wanted: string | null | undefined) {
  return options.find(option => option === wanted) ?? (wanted ? aliases?.[wanted] : undefined)
}

// a choice among a fixed list of options, kept in the url & remembered in the browser, applied as a data attribute on the page
// the third value tells if a choice was really made, or if the default is only there for lack of one
export function usePreference<Option extends string>(name: string, options: readonly Option[], { aliases, defaultOption, keepsChoice = false }: Extras<Option> = {}) {
  const fallback = defaultOption ?? options[0]
  const storageKey = `${storagePrefix}${name}`
  // a shared link wins over what this browser remembers
  const readChoice = () => findOption(options, aliases, hashToData(document.location.hash).settings[name] ?? localStorage.getItem(storageKey))
  const [value, setValue] = useState(() => readChoice() ?? fallback)
  const [isChosen, setIsChosen] = useState(() => readChoice() !== undefined)

  useEffect(() => {
    document.documentElement.dataset[name] = value
    // the url only gets the setting when it matters : a shared link must carry it, but a default one stays clean
    const inUrl = hashToData(document.location.hash).settings[name]
    if (inUrl !== value && (inUrl !== undefined || value !== fallback || (keepsChoice && isChosen))) writeHashSetting(name, value)
  }, [fallback, isChosen, keepsChoice, name, value])

  // the hash can change from outside, like a pasted url or a back button
  useEffect(() => {
    const onHashChange = () => {
      const option = findOption(options, aliases, hashToData(document.location.hash).settings[name])
      if (option === undefined) return
      setValue(option)
      setIsChosen(true)
    }
    globalThis.addEventListener('hashchange', onHashChange)
    return () => globalThis.removeEventListener('hashchange', onHashChange)
  }, [aliases, name, options])

  const change = useCallback(
    (next: Option) => {
      localStorage.setItem(storageKey, next)
      setValue(next)
      setIsChosen(true)
    },
    [storageKey],
  )

  return [value, change, isChosen] as const
}
