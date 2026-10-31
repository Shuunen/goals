import { defaultTitle, storagePrefix } from './defaults.utils'
import { dataToHash } from './hash.utils'

// forgets the goals & every setting of this browser, then starts again from a clean page : an empty list with the default title
// reloading is what makes every setting go back to its default
export function clearEverything() {
  for (const key of Object.keys(localStorage)) if (key.startsWith(storagePrefix)) localStorage.removeItem(key)
  const { pathname, search } = document.location
  globalThis.history.replaceState(undefined, '', `${pathname}${search}${dataToHash(defaultTitle, [])}`)
  globalThis.location.reload()
}
