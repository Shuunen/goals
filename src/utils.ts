/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */
/* eslint-disable jsdoc/require-jsdoc */
import { Item } from './models'

const doneMarker = '!'
const separator = ','

function itemDataToHash (item: Item) {
  return `${item.isDone ? doneMarker : ''}${item.title}`
}

export function hashToData (hash: string) {
  let title = ''
  let items: Item[] = []
  const matches = (/(?<title>[\s\w]+=)?(?<items>[\s\w!,]+)/u.exec(decodeURI(hash)))
  if (matches === null) return { items, title }
  title = matches.groups?.title?.split('=')[0] ?? ''
  items = matches.groups?.items?.split(separator).map(item => {
    // item could be "become a ninja" or "!become a ninja" if it's done
    const data = item.split(doneMarker)
    const itemTitle = data[1] ?? item
    const expectedLength = 2
    const isDone = data.length === expectedLength
    return new Item(itemTitle, isDone)
    /* c8 ignore next */
  }) ?? []
  return { items, title }
}

export function dataToHash (title: string, items: Item[]) {
  return encodeURI(`#${title}=${items.map(item => itemDataToHash(item)).join(separator)}`)
}
