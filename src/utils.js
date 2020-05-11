import { Item } from './models.js'

export const dataFromHash = hash => {
  let title = ''
  let items = []
  const matches = decodeURI(hash).match(/([\w\s]+=)?([\w\s!,]+)+/) || []
  if (!matches.length) return { title, items }
  title = matches[1] ? matches[1].split('=')[0] : title
  items = matches[2].split(',').map(item => {
    // item could be "become a ninja" or "!become a ninja" if it's done
    const data = item.split('!')
    const title = data[1] || item
    const done = data.length === 2
    return new Item({ title, done })
  })
  return { title, items }
}
