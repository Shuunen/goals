import { useCallback } from 'react'
import { useGoals } from './use-goals'
import { useToast } from './use-toast'

// the goals, where every destructive action remembers the list first and tells it in a toast with an Undo
export function useUndoableGoals() {
  const goals = useGoals()
  const { dismissToast, showToast, toast } = useToast()
  const { forget, remember, resetAll, undo } = goals

  const announce = useCallback((message: string) => showToast({ actionLabel: 'Undo', message, onAction: undo, onExpire: forget }), [forget, showToast, undo])

  const resetAllUndoable = useCallback(() => {
    remember()
    resetAll()
    announce('All goals unchecked')
  }, [announce, remember, resetAll])

  return { ...goals, dismissToast, resetAll: resetAllUndoable, toast }
}
