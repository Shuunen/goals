import { defaultTitle, storagePrefix } from './defaults.utils'
import { dataToHash } from './hash.utils'
import { removeStoredWithPrefix } from './storage.utils'

// forgets the goals & every setting of this browser, then starts again from a clean page : an empty list with the default title
// reloading is what makes every setting go back to its default
export function clearEverything() {
  removeStoredWithPrefix(storagePrefix)
  const { pathname, search } = document.location
  globalThis.history.replaceState(undefined, '', `${pathname}${search}${dataToHash(defaultTitle, [])}`)
  globalThis.location.reload()
}
