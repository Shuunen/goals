import { useState } from 'react'
import { ClearDone } from '../components/clear-done'
import { EditableText } from '../components/editable-text'
import { GearIcon } from '../components/gear-icon'
import { GoalList } from '../components/goal-list'
import { PencilIcon } from '../components/pencil-icon'
import { ProgressBar } from '../components/progress-bar'
import { SettingsModal } from '../components/settings-modal'
import { Toast } from '../components/toast'
import { useEscapeToLeave } from '../hooks/use-escape-to-leave'
import { useFont } from '../hooks/use-font'
import { useScrollHide } from '../hooks/use-scroll-hide'
import { useSize } from '../hooks/use-size'
import { useTheme } from '../hooks/use-theme'
import { useUndoableGoals } from '../hooks/use-undoable-goals'

export function App() {
  const { addItem, addItems, clearDone, dismissToast, items, moveItem, removeItem, renameItem, renameTitle, resetAll, title, toast, toggleItem } = useUndoableGoals()
  const { labelFont, pickFont, titleFont } = useFont()
  const { changeTheme, theme } = useTheme()
  const sizing = useSize()
  const [isEditing, setIsEditing] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  // the buttons only step aside while reading : never while editing or with the settings open
  const isScrolledAway = useScrollHide() && !isEditing && !isSettingsOpen
  const cornerClass = isScrolledAway ? 'is-away' : ''
  // with the settings open, the Escape key closes them first
  useEscapeToLeave(isEditing && !isSettingsOpen, () => setIsEditing(false))
  // the name says what a press does, so there is no pressed state to announce twice
  const editLabel = isEditing ? 'Done editing' : 'Edit goals'
  const doneCount = items.filter(item => item.isDone).length
  return (
    <main>
      {/* same two corners on every screen size : settings pinned top right, edit pinned bottom right */}
      <button aria-label="Settings" className={`icon-button settings-button ${cornerClass}`} onClick={() => setIsSettingsOpen(true)} title="Settings" type="button">
        <GearIcon />
      </button>
      {isEditing ? <EditableText className="title" key={title} label="Title" onCommit={renameTitle} value={title} /> : <h1 className="title">{title}</h1>}
      <ProgressBar done={doneCount} isEditing={isEditing} total={items.length} />
      {items.length === 0 && !isEditing ? <p className="empty-hint">Tap the pencil to add a goal</p> : undefined}
      <GoalList isEditing={isEditing} items={items} onAdd={addItem} onAddMany={addItems} onMove={moveItem} onRemove={removeItem} onRename={renameItem} onToggle={toggleItem} />
      <ClearDone count={doneCount} isEditing={isEditing} onClear={clearDone} />
      <SettingsModal
        canReset={doneCount > 0}
        isOpen={isSettingsOpen}
        labelFont={labelFont}
        onClose={() => setIsSettingsOpen(false)}
        onFontPick={pickFont}
        onReset={resetAll}
        onThemeChange={changeTheme}
        sizing={sizing}
        theme={theme}
        titleFont={titleFont}
      />
      <Toast onDismiss={dismissToast} toast={toast} />
      <button aria-label={editLabel} className={`edit-button ${cornerClass}`} data-editing={isEditing} onClick={() => setIsEditing(!isEditing)} title={editLabel} type="button">
        <PencilIcon />
      </button>
    </main>
  )
}
