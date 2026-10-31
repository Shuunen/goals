import { createItem, type Item } from '../models/item.model'
import { sanitizeText } from './hash.utils'

const listPrefix = /^(?:[-*•]|\d+[.)])(?:\s+|$)/u
const checkbox = /^\[(?<mark>[ xX])\]\s*/u

// goals from pasted lines : list prefixes (-, *, •, 1., 1)) are dropped, [x] marks a done goal & [ ] an open one, empty lines vanish
export function parseGoalLines(text: string): Item[] {
  return text
    .split(/\r?\n/u)
    .map(line => {
      const withoutPrefix = line.trim().replace(listPrefix, '')
      const mark = checkbox.exec(withoutPrefix)?.groups?.mark
      const title = sanitizeText(withoutPrefix.replace(checkbox, ''))
      return createItem(title, mark !== undefined && mark !== ' ')
    })
    .filter(item => item.title.length > 0)
}
