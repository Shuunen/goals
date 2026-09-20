import { createItem, type Item } from '../models/item.model'

const doneMarker = '!'
const separator = ','

function itemToHash(item: Item) {
  return `${item.isDone ? doneMarker : ''}${item.title}`
}

export function hashToData(hash: string) {
  let title = ''
  let items: Item[] = []
  const matches = /(?<title>[\s\w]+=)?(?<items>[\s\w!,]+)/u.exec(decodeURI(hash))
  if (matches?.groups?.items === undefined) return { items, title }
  title = matches.groups.title?.split('=')[0] ?? ''
  items = matches.groups.items.split(separator).map(item => {
    // item could be "become a ninja" or "!become a ninja" if it's done
    const data = item.split(doneMarker)
    const itemTitle = data[1] ?? item
    const expectedLength = 2
    const isDone = data.length === expectedLength
    return createItem(itemTitle, isDone)
  })
  return { items, title }
}

export function dataToHash(title: string, items: Item[]) {
  return encodeURI(`#${title}=${items.map(item => itemToHash(item)).join(separator)}`)
}
