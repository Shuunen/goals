import { useCallback } from 'react'
import type { Item } from '../models/item.model'
import { useGoals } from './use-goals'
import { type ToastData, useToast } from './use-toast'

// Undo gives back a whole earlier list : a plain edit made while it is on offer ends the offer, so Undo never wipes that edit
function useAfterUndoOffer(toast: ToastData | undefined, dismissToast: () => void, forget: () => void) {
  return useCallback(
    <Args extends unknown[]>(edit: (...args: Args) => void) =>
      (...args: Args) => {
        if (toast?.actionLabel === 'Undo') {
          dismissToast()
          forget()
        }
        edit(...args)
      },
    [dismissToast, forget, toast],
  )
}

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

  const afterUndoOffer = useAfterUndoOffer(toast, dismissToast, forget)

  return {
    ...goals,
    addItem: afterUndoOffer(goals.addItem),
    addItems: (added: Item[]) => undoable(`Added ${added.length} ${added.length === 1 ? 'goal' : 'goals'}`, () => addItems(added)),
    clearDone: clearDoneUndoable,
    dismissToast,
    moveItem: afterUndoOffer(goals.moveItem),
    removeItem: removeItemUndoable,
    renameItem: afterUndoOffer(goals.renameItem),
    renameTitle: afterUndoOffer(goals.renameTitle),
    replaceList: (imported: Item[], title?: string) => undoable(`List replaced by ${imported.length} ${imported.length === 1 ? 'goal' : 'goals'}`, () => replaceList(imported, title)),
    resetAll: () => undoable('All goals unchecked', resetAll),
    showToast,
    toast,
    toggleItem: afterUndoOffer(goals.toggleItem),
  }
}
