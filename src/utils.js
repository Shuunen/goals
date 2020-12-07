import { Item } from './models.js'

const doneMarker = '!'
const separator = ','

export const hashToData = hash => {
  let title = ''
  let items = []
  const matches = decodeURI(hash).match(/([\w\s]+=)?([\w\s!,]+)+/) || []
  if (!matches.length) return { title, items }
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
  return encodeURI(`#${title}=${items.map(i => `${i.done ? doneMarker : ''}${i.title}`).join(separator)}`)
}
