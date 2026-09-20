/* v8 ignore start -- @preserve */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import { App } from './pages/app.page'

const rootElement = document.querySelector('#root')
if (rootElement === null) throw new Error('Root element not found')
const root = createRoot(rootElement)

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
)
