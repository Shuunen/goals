import { createItem, type Item } from '../models/item.model'
import { parseGoalLines } from './goal-lines.utils'
import { sanitizeText } from './hash.utils'

// a link or a screen with more goals than this is not a list anymore
export const maxImportedGoals = 500

const jsonIndent = 2

export type Imported = { isTruncated: boolean; items: Item[]; title: string | undefined }

export function toJson(title: string, items: Item[]) {
  return JSON.stringify({ items: items.map(item => ({ isDone: item.isDone, title: item.title })), title, version: 1 }, undefined, jsonIndent)
}

// a Markdown checklist, which parseImport reads back
export function toMarkdown(title: string, items: Item[]) {
  return `# ${title}\n\n${items.map(item => `- [${item.isDone ? 'x' : ' '}] ${item.title}`).join('\n')}\n`
}

export function fileName(title: string) {
  const slug = title
    .normalize('NFD')
    .replaceAll(/\p{M}/gu, '')
    .toLowerCase()
    .replaceAll(/[^a-z\d]+/gu, '-')
    .replaceAll(/^-+|-+$/gu, '')
  return `goals-${slug.length > 0 ? slug : 'list'}.json`
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value)

// nothing from the file is trusted : every entry is checked and sanitized
function itemFromJson(entry: unknown) {
  if (typeof entry === 'string') return createItem(sanitizeText(entry))
  if (isRecord(entry) && typeof entry.title === 'string') return createItem(sanitizeText(entry.title), entry.isDone === true)
  return createItem()
}

function fromJson(text: string): Imported {
  const empty = { isTruncated: false, items: [], title: undefined }
  let data: unknown = undefined
  try {
    data = JSON.parse(text)
  } catch {
    return empty
  }
  const entries: unknown = isRecord(data) ? data.items : data
  if (!Array.isArray(entries)) return empty
  const title = isRecord(data) && typeof data.title === 'string' ? sanitizeText(data.title) : ''
  return capped(
    entries.map(entry => itemFromJson(entry)).filter(item => item.title.length > 0),
    title,
  )
}

function capped(items: Item[], title: string): Imported {
  return { isTruncated: items.length > maxImportedGoals, items: items.slice(0, maxImportedGoals), title: title.length > 0 ? title : undefined }
}

const titleLine = /^#[ \t]+(?<title>[^\r\n]+)(?:\r?\n|$)/u

// the JSON of toJson, a Markdown checklist (a first "# title" line is the title), or plain lines
export function parseImport(text: string): Imported {
  const trimmed = text.trim()
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) return fromJson(trimmed)
  const heading = titleLine.exec(trimmed)
  const title = heading?.groups?.title ?? ''
  return capped(parseGoalLines(heading ? trimmed.slice(heading[0].length) : trimmed), sanitizeText(title))
}
