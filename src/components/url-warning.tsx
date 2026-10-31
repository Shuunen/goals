import { isUrlLong } from '../utils/url.utils'

type UrlWarningProps = { isEditing: boolean; length: number }

// a small note under the list while editing, a long list makes a long link and some apps cut those
// it keeps its place outside the edit mode, so the goals never move when switching
export function UrlWarning({ isEditing, length }: Readonly<UrlWarningProps>) {
  if (!isUrlLong(length)) return undefined
  return (
    <p aria-hidden={!isEditing} className={`url-warning ${isEditing ? '' : 'invisible'}`}>
      This list is getting long: some apps may cut shared links
    </p>
  )
}
