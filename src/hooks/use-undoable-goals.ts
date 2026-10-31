import { useCallback } from 'react'
import type { Item } from '../models/item.model'
import { useGoals } from './use-goals'
import { useToast } from './use-toast'

// the goals, where every destructive action remembers the list first and tells it in a toast with an Undo
export function useUndoableGoals() {
  const goals = useGoals()
  const { dismissToast, showToast, toast } = useToast()
  const { addItems, clearDone, forget, items, remember, removeItem, resetAll, undo } = goals

  const announce = useCallback((message: string) => showToast({ actionLabel: 'Undo', message, onAction: undo, onExpire: forget }), [forget, showToast, undo])

  const resetAllUndoable = useCallback(() => {
    remember()
    resetAll()
    announce('All goals unchecked')
  }, [announce, remember, resetAll])

  const removeItemUndoable = useCallback(
    (index: number) => {
      const item = items[index]
      if (item === undefined) return
      remember()
      removeItem(index)
      announce(`Removed “${item.title}”`)
    },
    [announce, items, remember, removeItem],
  )

  const addItemsUndoable = useCallback(
    (added: Item[]) => {
      remember()
      addItems(added)
      announce(`Added ${added.length} goals`)
    },
    [addItems, announce, remember],
  )

  const clearDoneUndoable = useCallback(() => {
    const count = items.filter(item => item.isDone).length
    if (count === 0) return
    remember()
    clearDone()
    announce(`Cleared ${count} done ${count === 1 ? 'goal' : 'goals'}`)
  }, [announce, clearDone, items, remember])

  return { ...goals, addItems: addItemsUndoable, clearDone: clearDoneUndoable, dismissToast, removeItem: removeItemUndoable, resetAll: resetAllUndoable, toast }
}
