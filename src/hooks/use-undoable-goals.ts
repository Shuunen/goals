import { useCallback } from 'react'
import type { Item } from '../models/item.model'
import { useGoals } from './use-goals'
import { useToast } from './use-toast'

// the goals, where every destructive action remembers the list first and tells it in a toast with an Undo
export function useUndoableGoals() {
  const goals = useGoals()
  const { dismissToast, showToast, toast } = useToast()
  const { addItems, clearDone, forget, items, remember, removeItem, replaceList, resetAll, undo } = goals

  const undoable = useCallback(
    (message: string, action: () => void) => {
      remember()
      action()
      showToast({ actionLabel: 'Undo', message, onAction: undo, onExpire: forget })
    },
    [forget, remember, showToast, undo],
  )

  const removeItemUndoable = useCallback(
    (index: number) => {
      const item = items[index]
      if (item !== undefined) undoable(`Removed “${item.title}”`, () => removeItem(index))
    },
    [items, removeItem, undoable],
  )

  const clearDoneUndoable = useCallback(() => {
    const count = items.filter(item => item.isDone).length
    if (count > 0) undoable(`Cleared ${count} done ${count === 1 ? 'goal' : 'goals'}`, clearDone)
  }, [clearDone, items, undoable])

  return {
    ...goals,
    addItems: (added: Item[]) => undoable(`Added ${added.length} goals`, () => addItems(added)),
    clearDone: clearDoneUndoable,
    dismissToast,
    removeItem: removeItemUndoable,
    replaceList: (imported: Item[], title?: string) => undoable(`List replaced by ${imported.length} goals`, () => replaceList(imported, title)),
    resetAll: () => undoable('All goals unchecked', resetAll),
    showToast,
    toast,
  }
}
