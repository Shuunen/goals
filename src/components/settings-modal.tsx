import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { version } from '../../package.json'
import { useDialogFocus } from '../hooks/use-dialog-focus'
import { fontLabels, fonts, type Font } from '../hooks/use-font'
import type { Size } from '../hooks/use-size'
import { themes, type Theme } from '../hooks/use-theme'
import { ChoiceGrid } from './choice-grid'
import { CloseIcon } from './close-icon'
import { SizeStepper } from './size-stepper'

type SettingsModalProps = {
  canGrow: boolean
  canReset: boolean
  canShrink: boolean
  isOpen: boolean
  labelFont: Font
  onClose: () => void
  onFontPick: (font: Font) => void
  onLarger: () => void
  onReset: () => void
  onSmaller: () => void
  onThemeChange: (theme: Theme) => void
  size: Size
  theme: Theme
  titleFont: Font
}

const repositoryUrl = 'https://github.com/Shuunen/goals'

// a swatch can carry both badges at once (title and labels on the same font) or just one
function fontMarkers(labelFont: Font, titleFont: Font) {
  const markers: Partial<Record<Font, string[]>> = {}
  ;(markers[titleFont] ??= []).push('Title')
  ;(markers[labelFont] ??= []).push('Label')
  return markers
}

const focusable = 'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'

// Tab & Shift+Tab turn around inside the dialog instead of reaching the page behind it
function trapTab(event: ReactKeyboardEvent<HTMLDivElement>) {
  if (event.key !== 'Tab') return
  const inside = [...event.currentTarget.querySelectorAll<HTMLElement>(focusable)]
  const first = inside.at(0)
  const last = inside.at(-1)
  const active = document.activeElement
  const isLeavingStart = event.shiftKey && (active === first || active === event.currentTarget)
  const isLeavingEnd = !event.shiftKey && active === last
  if (!isLeavingStart && !isLeavingEnd) return
  event.preventDefault()
  ;(isLeavingStart ? last : first)?.focus()
}

export function SettingsModal({ canGrow, canReset, canShrink, isOpen, labelFont, onClose, onFontPick, onLarger, onReset, onSmaller, onThemeChange, size, theme, titleFont }: SettingsModalProps) {
  const dialog = useDialogFocus(isOpen, onClose)
  return (
    // always mounted so it can animate in and out, inert & hidden from assistive tech while closed
    <div aria-hidden={!isOpen} className={`modal-backdrop ${isOpen ? 'open' : ''}`} inert={!isOpen} onClick={onClose} role="presentation">
      <div aria-labelledby="settings-title" aria-modal="true" className="modal" onClick={event => event.stopPropagation()} onKeyDown={trapTab} ref={dialog} role="dialog" tabIndex={-1}>
        <header className="modal-header">
          <h2 id="settings-title">Settings</h2>
          <button aria-label="Close" className="icon-button" onClick={onClose} type="button">
            <CloseIcon />
          </button>
        </header>
        <ChoiceGrid attribute="data-theme" legend="Theme" onChange={onThemeChange} options={themes} value={theme} />
        <ChoiceGrid attribute="data-font" labels={fontLabels} legend="Fonts" markers={fontMarkers(labelFont, titleFont)} onChange={onFontPick} options={fonts} />
        <SizeStepper canGrow={canGrow} canShrink={canShrink} onLarger={onLarger} onSmaller={onSmaller} size={size} />
        <fieldset className="list-actions">
          <legend>Your list</legend>
          <button disabled={!canReset} onClick={onReset} type="button">
            Reset all
          </button>
        </fieldset>
        <dl className="about">
          <dt>Repository</dt>
          <dd>
            <a href={repositoryUrl} rel="noreferrer" target="_blank">
              Shuunen/goals ↗
            </a>
          </dd>
          <dt>Version</dt>
          <dd>{version}</dd>
        </dl>
      </div>
    </div>
  )
}
