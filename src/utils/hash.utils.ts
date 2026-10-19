import { createItem, type Item } from '../models/item.model'

const doneMarker = '!'
const separator = ','

function itemToHash(item: Item) {
  return `${item.isDone ? doneMarker : ''}${item.title}`
}

// the goals come first, then the settings as query params : #My goals=have fun,!avoid shitty job&theme=dark&font=mono
const settingsSeparator = '&'

export type Settings = Record<string, string>

export function hashToData(hash: string) {
  let title = ''
  let items: Item[] = []
  const [goals = '', ...settingsParts] = decodeURI(hash).split(settingsSeparator)
  const settings: Settings = Object.fromEntries(new URLSearchParams(settingsParts.join(settingsSeparator)))
  const matches = /(?<title>[\s\w]+=)?(?<items>[\s\w!,]+)/u.exec(goals)
  if (matches?.groups?.items === undefined) return { items, settings, title }
  title = matches.groups.title?.split('=')[0] ?? ''
  items = matches.groups.items.split(separator).map(item => {
    // item could be "become a ninja" or "!become a ninja" if it's done
    const data = item.split(doneMarker)
    const itemTitle = data[1] ?? item
    const expectedLength = 2
    const isDone = data.length === expectedLength
    return createItem(itemTitle, isDone)
  })
  return { items, settings, title }
}

export function dataToHash(title: string, items: Item[], settings: Settings = {}) {
  const goals = items.length > 0 ? `${title}=${items.map(item => itemToHash(item)).join(separator)}` : ''
  const params = Object.entries(settings).map(([key, value]) => `${settingsSeparator}${key}=${value}`)
  return encodeURI(`#${goals}${params.join('')}`)
}

// change one setting in the current location, leaving the goals as they are
export function writeHashSetting(name: string, value: string) {
  const { items, settings, title } = hashToData(document.location.hash)
  document.location.hash = dataToHash(title, items, { ...settings, [name]: value })
}

// keep only what the hash format can store : letters, digits, underscores & single spaces
export function sanitizeText(text: string) {
  return text
    .replaceAll(/[^\s\w]/gu, '')
    .replaceAll(/\s+/gu, ' ')
    .trim()
}
