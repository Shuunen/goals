import { useEffect } from 'react'
import { version } from '../../package.json'
import { fontLabels, fonts, type Font } from '../hooks/use-font'
import { themes, type Theme } from '../hooks/use-theme'
import { ChoiceGrid } from './choice-grid'
import { CloseIcon } from './close-icon'

type SettingsModalProps = {
  isOpen: boolean
  labelFont: Font
  onClose: () => void
  onFontPick: (font: Font) => void
  onThemeChange: (theme: Theme) => void
  theme: Theme
  titleFont: Font
}

const repositoryUrl = 'https://github.com/Shuunen/goals'

// a swatch can carry both badges at once (title and labels on the same font) or just one
function fontMarkers(labelFont: Font, titleFont: Font) {
  const markers: Partial<Record<Font, string[]>> = {}
  ;(markers[titleFont] ??= []).push('T')
  ;(markers[labelFont] ??= []).push('L')
  return markers
}

export function SettingsModal({ isOpen, labelFont, onClose, onFontPick, onThemeChange, theme, titleFont }: SettingsModalProps) {
  useEffect(() => {
    if (!isOpen) return undefined
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])
  return (
    // always mounted so it can animate in and out, inert & hidden from assistive tech while closed
    <div aria-hidden={!isOpen} className={`modal-backdrop ${isOpen ? 'open' : ''}`} inert={!isOpen} onClick={onClose} role="presentation">
      <div aria-label="Settings" aria-modal="true" className="modal" onClick={event => event.stopPropagation()} role="dialog">
        <header className="modal-header">
          <h2>Settings</h2>
          <button aria-label="Close" className="icon-button" onClick={onClose} type="button">
            <CloseIcon />
          </button>
        </header>
        <ChoiceGrid attribute="data-theme" legend="Theme" onChange={onThemeChange} options={themes} value={theme} />
        <ChoiceGrid attribute="data-font" labels={fontLabels} legend="Font — click sets title, then labels, then title…" markers={fontMarkers(labelFont, titleFont)} onChange={onFontPick} options={fonts} />
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
