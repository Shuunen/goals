// the browser memory can be blocked (private mode, site data off) or full : the app then lives from the url alone, instead of crashing

export function readStored(key: string) {
  try {
    return localStorage.getItem(key)
  } catch {
    return undefined
  }
}

export function writeStored(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // nothing to do : the url still carries the list
  }
}

export function removeStoredWithPrefix(prefix: string) {
  try {
    for (const key of Object.keys(localStorage)) if (key.startsWith(prefix)) localStorage.removeItem(key)
  } catch {
    // nothing to remove if the browser memory can't be reached
  }
}
