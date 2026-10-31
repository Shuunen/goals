import { useCallback, useState } from 'react'
import { createItem, type Item } from '../models/item.model'
import { dataToHash, hashToData, sanitizeText } from '../utils/hash.utils'
import { logger } from '../utils/logger.utils'

const defaultTitle = 'Goals'
const defaultItems = ['This is some default goals', 'Become a ninja', 'Eat lots of pastas'].map((title, index) => createItem(title, index === 1))

const storageKey = 'goals-saved'

type State = { items: Item[]; title: string }

function readInitialState(): State {
  // a shared link wins, else what this browser remembers : a PWA relaunch opens the start url without any hash
  const fromHash = hashToData(document.location.hash)
  const { items, title } = fromHash.items.length > 0 ? fromHash : hashToData(localStorage.getItem(storageKey) ?? '')
  const state = {
    items: items.length > 0 ? items : defaultItems,
    title: title.length > 0 ? title : defaultTitle,
  }
  logger.info('detected', state.items.length, 'items :', state.items)
  return state
}

function changeItemAt(state: State, index: number, change: (item: Item) => Item): State {
  return { ...state, items: state.items.map((item, itemIndex) => (itemIndex === index ? change(item) : item)) }
}

export function useGoals() {
  const [state, setState] = useState(readInitialState)

  const update = useCallback((change: (previous: State) => State) => {
    setState(previous => {
      const next = change(previous)
      document.location.hash = dataToHash(next.title, next.items, hashToData(document.location.hash).settings)
      localStorage.setItem(storageKey, dataToHash(next.title, next.items))
      return next
    })
  }, [])

  // empty values are ignored since an empty title or item can't be stored in the hash
  const updateText = useCallback(
    (value: string, change: (previous: State, text: string) => State) => {
      const text = sanitizeText(value)
      if (text.length > 0) update(previous => change(previous, text))
    },
    [update],
  )

  const toggleItem = useCallback((index: number) => update(previous => changeItemAt(previous, index, item => ({ ...item, isDone: !item.isDone }))), [update])
  const renameTitle = useCallback((value: string) => updateText(value, (previous, title) => ({ ...previous, title })), [updateText])
  const renameItem = useCallback((index: number, value: string) => updateText(value, (previous, title) => changeItemAt(previous, index, item => ({ ...item, title }))), [updateText])
  const addItem = useCallback((value: string) => updateText(value, (previous, title) => ({ ...previous, items: [...previous.items, createItem(title)] })), [updateText])
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
  const removeItem = useCallback((index: number) => update(previous => ({ ...previous, items: previous.items.filter((_item, itemIndex) => itemIndex !== index) })), [update])

  return { addItem, items: state.items, moveItem, removeItem, renameItem, renameTitle, title: state.title, toggleItem }
}
