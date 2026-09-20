import { useCallback, useState } from 'react'
import { createItem } from '../models/item.model'
import { dataToHash, hashToData } from '../utils/hash.utils'
import { logger } from '../utils/logger.utils'

const defaultTitle = 'Goals'
const defaultItems = ['This is some default goals', 'Become a ninja', 'Eat lots of pastas'].map((title, index) => createItem(title, index === 1))

function readInitialState() {
  const { items, title } = hashToData(document.location.hash)
  const state = {
    items: items.length > 0 ? items : defaultItems,
    title: title.length > 0 ? title : defaultTitle,
  }
  logger.info('detected', state.items.length, 'items :', state.items)
  return state
}

export function useGoals() {
  const [state, setState] = useState(readInitialState)

  const toggleItem = useCallback((index: number) => {
    setState(previousState => {
      let isDone = false
      const nextItems = previousState.items.map((item, itemIndex) => {
        if (itemIndex !== index) return item
        isDone = !item.isDone
        return { ...item, isDone }
      })
      logger.info('item at position', index, 'is now', isDone ? 'done' : 'undone')
      document.location.hash = dataToHash(previousState.title, nextItems)
      return { ...previousState, items: nextItems }
    })
  }, [])

  return { items: state.items, title: state.title, toggleItem }
}
