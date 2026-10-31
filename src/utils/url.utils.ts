import type { Item } from '../models/item.model'
import { dataToHash, hashToData } from './hash.utils'

// beyond this many characters, some apps cut a shared link
const urlWarnLength = 2000

export function isUrlLong(length: number) {
  return length >= urlWarnLength
}

// the link as it will be once the goals are saved in the hash : the settings are the ones of the current hash
export function buildShareUrl(title: string, items: Item[]) {
  const { hash, origin, pathname, search } = document.location
  return `${origin}${pathname}${search}${dataToHash(title, items, hashToData(hash).settings)}`
}
