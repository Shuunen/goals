import { isUrlLong } from '../utils/url.utils'

type UrlWarningProps = { isEditing: boolean; length: number }

// a small note under the list while editing, a long list makes a long link and some apps cut those
export function UrlWarning({ isEditing, length }: Readonly<UrlWarningProps>) {
  if (!isEditing || !isUrlLong(length)) return undefined
  return <p className="url-warning">This list is getting long: some apps may cut shared links</p>
}
