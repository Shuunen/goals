import { createItem, type Item } from '../models/item.model'

const doneMarker = '!'
const separator = ','
const titleSeparator = '='

// the goals come first, then the settings as query params : #My goals=have fun,!avoid shitty job&theme=dark&font=mono
// every title, item & setting is escaped on its own, so any text can travel in the hash : "!" is the done marker, so it gets escaped too
const settingsSeparator = '&'

export type Settings = Record<string, string>

function encodeText(text: string) {
  return encodeURIComponent(text).replaceAll('!', '%21')
}

// a malformed escape sequence (like a lonely %) must not crash the app, the raw text is kept
function decodeText(text: string) {
  try {
    return decodeURIComponent(text)
  } catch {
    return text
  }
}

function itemToHash(item: Item) {
  return `${item.isDone ? doneMarker : ''}${encodeText(item.title)}`
}

function hashToItem(part: string) {
  // part could be "become a ninja" or "!become a ninja" if it's done, a "!" inside the text is escaped
  const isDone = part.startsWith(doneMarker)
  return createItem(decodeText(isDone ? part.slice(doneMarker.length) : part), isDone)
}

function hashToSettings(parts: string[]): Settings {
  const entries = parts
    .filter(part => part.length > 0)
    .map(part => {
      const [key = '', ...value] = part.split(titleSeparator)
      // "+" is a space in a query param
      return [decodeText(key.replaceAll('+', ' ')), decodeText(value.join(titleSeparator).replaceAll('+', ' '))] as const
    })
  return Object.fromEntries(entries)
}

export function hashToData(hash: string) {
  const [goals = '', ...settingsParts] = hash.replace(/^#/u, '').split(settingsSeparator)
  const settings = hashToSettings(settingsParts)
  const titleEnd = goals.indexOf(titleSeparator)
  const hasTitle = titleEnd !== -1
  const title = hasTitle ? decodeText(goals.slice(0, titleEnd)) : ''
  const rawItems = hasTitle ? goals.slice(titleEnd + titleSeparator.length) : goals
  const items = rawItems
    .split(separator)
    .filter(part => part.length > 0)
    .map(part => hashToItem(part))
  return { items, settings, title }
}

// the goals part is there even for an empty list, else the title would be lost
export function dataToHash(title: string, items: Item[], settings: Settings = {}) {
  const hasGoals = title.length > 0 || items.length > 0
  const goals = hasGoals ? `${encodeText(title)}${titleSeparator}${items.map(item => itemToHash(item)).join(separator)}` : ''
  const params = Object.entries(settings).map(([key, value]) => `${settingsSeparator}${encodeText(key)}=${encodeText(value)}`)
  return `#${goals}${params.join('')}`
}

// replace, not assign : every change in the history would make the back button useless
export function replaceHash(hash: string) {
  if (hash !== document.location.hash) globalThis.history.replaceState(undefined, '', hash)
}

// change one setting in the current location, leaving the goals as they are, without adding a history entry
export function writeHashSetting(name: string, value: string) {
  const { items, settings, title } = hashToData(document.location.hash)
  replaceHash(dataToHash(title, items, { ...settings, [name]: value }))
}

// unicode normalized, without control chars, with single spaces : everything else is fine since the hash escapes it
export function sanitizeText(text: string) {
  return text.normalize('NFC').replaceAll(/\p{C}/gu, ' ').replaceAll(/\s+/gu, ' ').trim()
}
