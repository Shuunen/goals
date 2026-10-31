import { useState } from 'react'
import { EditableText } from '../components/editable-text'
import { GearIcon } from '../components/gear-icon'
import { GoalList } from '../components/goal-list'
import { PencilIcon } from '../components/pencil-icon'
import { ProgressBar } from '../components/progress-bar'
import { SettingsModal } from '../components/settings-modal'
import { Toast } from '../components/toast'
import { useFont } from '../hooks/use-font'
import { useScrollHide } from '../hooks/use-scroll-hide'
import { useSize } from '../hooks/use-size'
import { useTheme } from '../hooks/use-theme'
import { useUndoableGoals } from '../hooks/use-undoable-goals'

export function App() {
  const { addItem, dismissToast, items, moveItem, removeItem, renameItem, renameTitle, resetAll, title, toast, toggleItem } = useUndoableGoals()
  const { labelFont, pickFont, titleFont } = useFont()
  const { changeTheme, theme } = useTheme()
  const { canGrow, canShrink, larger, size, smaller } = useSize()
  const [isEditing, setIsEditing] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  // the buttons only step aside while reading : never while editing or with the settings open
  const isScrolledAway = useScrollHide() && !isEditing && !isSettingsOpen
  const cornerClass = isScrolledAway ? 'is-away' : ''
  const doneCount = items.filter(item => item.isDone).length
  return (
    <main>
      {/* same two corners on every screen size : settings pinned top right, edit pinned bottom right */}
      <button className={`icon-button settings-button ${cornerClass}`} onClick={() => setIsSettingsOpen(true)} title="Settings" type="button">
        <GearIcon />
      </button>
      {isEditing ? <EditableText className="title" key={title} label="Title" onCommit={renameTitle} value={title} /> : <h1 className="title">{title}</h1>}
      <ProgressBar done={doneCount} isEditing={isEditing} total={items.length} />
      {items.length === 0 && !isEditing ? <p className="empty-hint">Tap the pencil to add a goal</p> : undefined}
      <GoalList isEditing={isEditing} items={items} onAdd={addItem} onMove={moveItem} onRemove={removeItem} onRename={renameItem} onToggle={toggleItem} />
      <SettingsModal
        canGrow={canGrow}
        canReset={doneCount > 0}
        canShrink={canShrink}
        isOpen={isSettingsOpen}
        labelFont={labelFont}
        onClose={() => setIsSettingsOpen(false)}
        onFontPick={pickFont}
        onLarger={larger}
        onReset={resetAll}
        onSmaller={smaller}
        onThemeChange={changeTheme}
        size={size}
        theme={theme}
        titleFont={titleFont}
      />
      <Toast onDismiss={dismissToast} toast={toast} />
      <button aria-pressed={isEditing} className={`edit-button ${cornerClass}`} onClick={() => setIsEditing(!isEditing)} title="Edit" type="button">
        <PencilIcon />
      </button>
    </main>
  )
}
