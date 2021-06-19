import { Item } from './models'

const doneMarker = '!'
const separator = ','

export const hashToData = (hash: string): { title: string, items: Item[] } => {
  let title = ''
  let items = []
  const matches = decodeURI(hash).match(/([\s\w]+=)?([\s\w!,]+)+/) || []
  if (matches.length === 0) return { title, items }
  title = matches[1] ? matches[1].split('=')[0] : title
  items = matches[2].split(separator).map(item => {
    // item could be "become a ninja" or "!become a ninja" if it's done
    const data = item.split(doneMarker)
    const title = data[1] || item
    const done = data.length === 2
    return new Item(title, done)
  })
  return { title, items }
}

export const dataToHash = (title: string, items: Item[]): string => {
  return encodeURI(`#${title}=${items.map(item => `${item.done ? doneMarker : ''}${item.title}`).join(separator)}`)
}
