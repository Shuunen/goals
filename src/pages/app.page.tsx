import { useState } from 'react'
import { EditableText } from '../components/editable-text'
import { GearIcon } from '../components/gear-icon'
import { GoalList } from '../components/goal-list'
import { PencilIcon } from '../components/pencil-icon'
import { ProgressBar } from '../components/progress-bar'
import { SettingsModal } from '../components/settings-modal'
import { Toast } from '../components/toast'
import { useFont } from '../hooks/use-font'
import { useGoals } from '../hooks/use-goals'
import { useSize } from '../hooks/use-size'
import { useTheme } from '../hooks/use-theme'
import { useToast } from '../hooks/use-toast'

export function App() {
  const { addItem, items, moveItem, removeItem, renameItem, renameTitle, title, toggleItem } = useGoals()
  const { labelFont, pickFont, titleFont } = useFont()
  const { changeTheme, theme } = useTheme()
  const { canGrow, canShrink, larger, size, smaller } = useSize()
  const { dismissToast, toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  return (
    <main>
      {/* same two corners on every screen size : settings pinned top right, edit pinned bottom right */}
      <button className="icon-button settings-button" onClick={() => setIsSettingsOpen(true)} title="Settings" type="button">
        <GearIcon />
      </button>
      {isEditing ? <EditableText className="title" key={title} label="Title" onCommit={renameTitle} value={title} /> : <h1 className="title">{title}</h1>}
      <ProgressBar done={items.filter(item => item.isDone).length} isEditing={isEditing} total={items.length} />
      <GoalList isEditing={isEditing} items={items} onAdd={addItem} onMove={moveItem} onRemove={removeItem} onRename={renameItem} onToggle={toggleItem} />
      <SettingsModal
        canGrow={canGrow}
        canShrink={canShrink}
        isOpen={isSettingsOpen}
        labelFont={labelFont}
        onClose={() => setIsSettingsOpen(false)}
        onFontPick={pickFont}
        onLarger={larger}
        onSmaller={smaller}
        onThemeChange={changeTheme}
        size={size}
        theme={theme}
        titleFont={titleFont}
      />
      <Toast onDismiss={dismissToast} toast={toast} />
      <button aria-pressed={isEditing} className="edit-button" onClick={() => setIsEditing(!isEditing)} title="Edit" type="button">
        <PencilIcon />
      </button>
    </main>
  )
}
