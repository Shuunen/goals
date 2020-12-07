import { Item } from './models.js'

const doneMarker = '!'
const separator = ','

export const hashToData = hash => {
  let title = ''
  let items = []
  // eslint-disable-next-line unicorn/no-unsafe-regex
  const matches = decodeURI(hash).match(/([\s\w]+=)?([\s\w!,]+)+/) || []
  if (matches.length === 0) return { title, items }
  title = matches[1] ? matches[1].split('=')[0] : title
  items = matches[2].split(separator).map(item => {
    // item could be "become a ninja" or "!become a ninja" if it's done
    const data = item.split(doneMarker)
    const title = data[1] || item
    const done = data.length === 2
    return new Item({ title, done })
  })
  return { title, items }
}

export const dataToHash = (title, items) => {
  return encodeURI(`#${title}=${items.map(item => `${item.done ? doneMarker : ''}${item.title}`).join(separator)}`)
}
