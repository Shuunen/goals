import { Item } from './models'

const doneMarker = '!'
const separator = ','

function itemDataToHash (item: Item): string {
  return `${item.isDone ? doneMarker : ''}${item.title}`
}

export function hashToData (hash: string): { title: string; items: Item[] } {
  let title = ''
  let items: Item[] = []
  // eslint-disable-next-line security/detect-unsafe-regex, unicorn/no-unsafe-regex, regexp/no-super-linear-move
  const matches = (/(?<title>[\s\w]+=)?(?<items>[\s\w!,]+)/u.exec(decodeURI(hash)))
  if (matches === null) return { title, items }
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
  return { title, items }
}

export function dataToHash (title: string, items: Item[]): string {
  return encodeURI(`#${title}=${items.map(item => itemDataToHash(item)).join(separator)}`)
}
