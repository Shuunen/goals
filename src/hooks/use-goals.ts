import { useCallback, useEffect, useRef, useState } from 'react'
import { createItem, type Item } from '../models/item.model'
import { dataToHash, hashToData, replaceHash, sanitizeText } from '../utils/hash.utils'
import { logger } from '../utils/logger.utils'

const defaultTitle = 'Goals'
const defaultItems = ['This is some default goals', 'Become a ninja', 'Eat lots of pastas'].map((title, index) => createItem(title, index === 1))

const storageKey = 'goals-saved'

type Snapshot = { items: Item[]; title: string }
type State = Snapshot & { undoStack: Snapshot[] }

const undoLimit = 10

type SetState = (state: State | ((previous: State) => State)) => void

function hasGoals({ items, title }: Snapshot) {
  return items.length > 0 || title.length > 0
}

function toState({ items, title }: Snapshot): State {
  return { items, title: title.length > 0 ? title : defaultTitle, undoStack: [] }
}

function readInitialState(): State {
  // a shared link wins, else what this browser remembers : a PWA relaunch opens the start url without any hash
  const fromHash = hashToData(document.location.hash)
  const fromStorage = hashToData(localStorage.getItem(storageKey) ?? '')
  const found = [fromHash, fromStorage].find(data => hasGoals(data))
  // the defaults are for a first visit only : an emptied list, stored or shared, stays empty
  const state = found ? toState(found) : { items: defaultItems, title: defaultTitle, undoStack: [] }
  logger.info('detected', state.items.length, 'items :', state.items)
  return state
}

function changeItemAt(state: State, index: number, change: (item: Item) => Item): State {
  return { ...state, items: state.items.map((item, itemIndex) => (itemIndex === index ? change(item) : item)) }
}

// keeps the url & the browser memory in line with the state, in both ways
function useSync(state: State, setState: SetState) {
  // only a change made here is saved : opening a shared link must not replace what this browser remembers
  const isChanged = useRef(false)
  const markChanged = useCallback(() => {
    isChanged.current = true
  }, [])

  useEffect(() => {
    if (!isChanged.current) return
    isChanged.current = false
    replaceHash(dataToHash(state.title, state.items, hashToData(document.location.hash).settings))
    localStorage.setItem(storageKey, dataToHash(state.title, state.items))
  }, [state])

  // the hash can change from outside : a typed or pasted url, a link click, back & forward
  useEffect(() => {
    const onHashChange = () => {
      const data = hashToData(document.location.hash)
      if (!hasGoals(data)) return
      const next = toState(data)
      setState(previous => (dataToHash(previous.title, previous.items) === dataToHash(next.title, next.items) ? previous : next))
    }
    globalThis.addEventListener('hashchange', onHashChange)
    return () => globalThis.removeEventListener('hashchange', onHashChange)
  }, [setState])

  return markChanged
}

// a destructive action remembers the list as it was, undo gives back the most recent one exactly
function useUndo(setState: SetState, markChanged: () => void) {
  const remember = useCallback(() => setState(previous => ({ ...previous, undoStack: [...previous.undoStack, { items: previous.items, title: previous.title }].slice(-undoLimit) })), [setState])
  const forget = useCallback(() => setState(previous => (previous.undoStack.length > 0 ? { ...previous, undoStack: [] } : previous)), [setState])
  const undo = useCallback(() => {
    markChanged()
    setState(previous => {
      const last = previous.undoStack.at(-1)
      return last ? { items: last.items, title: last.title, undoStack: previous.undoStack.slice(0, -1) } : previous
    })
  }, [markChanged, setState])
  return { forget, remember, undo }
}

// a checked goal sinks to the end of the list, an unchecked one goes back to the boundary, right after the open goals
function toggleAt(state: State, index: number): State {
  const item = state.items[index]
  if (item === undefined) return state
  const toggled = { ...item, isDone: !item.isDone }
  const others = state.items.filter((_other, otherIndex) => otherIndex !== index)
  const firstDone = others.findIndex(other => other.isDone)
  const target = toggled.isDone || firstDone === -1 ? others.length : firstDone
  return { ...state, items: [...others.slice(0, target), toggled, ...others.slice(target)] }
}

export function useGoals() {
  const [state, setState] = useState(readInitialState)
  const markChanged = useSync(state, setState)

  const update = useCallback(
    (change: (previous: State) => State) => {
      markChanged()
      setState(change)
    },
    [markChanged],
  )

  // empty values are ignored since an empty title or item can't be stored in the hash
  const updateText = useCallback(
    (value: string, change: (previous: State, text: string) => State) => {
      const text = sanitizeText(value)
      if (text.length > 0) update(previous => change(previous, text))
    },
    [update],
  )

  const toggleItem = useCallback((index: number) => update(previous => toggleAt(previous, index)), [update])
  const renameTitle = useCallback((value: string) => updateText(value, (previous, title) => ({ ...previous, title })), [updateText])
  const renameItem = useCallback((index: number, value: string) => updateText(value, (previous, title) => changeItemAt(previous, index, item => ({ ...item, title }))), [updateText])
  const addItem = useCallback((value: string) => updateText(value, (previous, title) => ({ ...previous, items: [...previous.items, createItem(title)] })), [updateText])
  // several goals in one update : one hash write, one undo snapshot
  const addItems = useCallback((items: Item[]) => update(previous => ({ ...previous, items: [...previous.items, ...items] })), [update])
  const moveItem = useCallback(
    (from: number, to: number) => {
      update(previous => {
        const isInRange = (index: number) => index >= 0 && index < previous.items.length
        if (from === to || !isInRange(from) || !isInRange(to)) return previous
        const items = [...previous.items]
        items.splice(to, 0, ...items.splice(from, 1))
        return { ...previous, items }
      })
    },
    [update],
  )
  const resetAll = useCallback(() => update(previous => ({ ...previous, items: previous.items.map(item => ({ ...item, isDone: false })) })), [update])
  const clearDone = useCallback(() => update(previous => ({ ...previous, items: previous.items.filter(item => !item.isDone) })), [update])
  const removeItem = useCallback((index: number) => update(previous => ({ ...previous, items: previous.items.filter((_item, itemIndex) => itemIndex !== index) })), [update])

  const { forget, remember, undo } = useUndo(setState, markChanged)

  return { addItem, addItems, clearDone, forget, items: state.items, moveItem, remember, removeItem, renameItem, renameTitle, resetAll, title: state.title, toggleItem, undo }
}
