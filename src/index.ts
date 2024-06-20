/* c8 ignore start */
import { h1, ul } from 'shuutils'
import { logger } from './logger'
import { Item } from './models'
import { dataToHash, hashToData } from './utils'

const defaultTitle = 'Goals'
const defaultItems = ['This is some default goals', 'Become a ninja', 'Eat lots of pastas'].map((title, index) => new Item(title, (index === 1)))

// eslint-disable-next-line no-restricted-syntax
class App {

  private items: Item[] = []

  private readonly itemsElement = ul('list')

  private title = ''

  private readonly titleElement = h1('title')

  public constructor () {
    this.setupElements()
    this.setupListeners()
    this.checkDataSources()
  }

  private setupElements () {
    const main = document.querySelector('main')
    if (!main) throw new Error('No main element found')
    main.append(this.titleElement)
    main.append(this.itemsElement)
  }

  private setupListeners () {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    this.itemsElement.addEventListener('click', event => { this.onListClick(event.target as unknown as HTMLInputElement) })
  }

  private checkDataSources () {
    const { items, title } = hashToData(document.location.hash)
    this.title = title.length > 0 ? title : defaultTitle
    this.items = items.length > 0 ? items : defaultItems
    logger.info('detected', this.items.length, 'items :', this.items)
    if (this.items.length > 0) this.render()
  }

  private render () {
    this.titleElement.textContent = this.title
    // eslint-disable-next-line no-unsanitized/property
    this.itemsElement.innerHTML = this.items.map((item, index) => `<li>
      <label class="item ${item.isDone ? 'done' : ''}">
        <input type=checkbox ${item.isDone ? 'checked' : ''} value=${index}>
        <span class=title>${item.title}</span>
      </label>
    </li>`).join('\n')
  }

  private onListClick (element: HTMLInputElement) {
    if (element.tagName !== 'INPUT') return
    const isDone = element.checked
    const index = Number.parseInt(element.value, 10)
    const item = this.items[index]
    logger.info('item at position', index, 'is now', isDone ? 'done' : 'undone')
    if (item !== undefined) item.isDone = isDone
    this.render()
    this.updateUrl()
  }

  private updateUrl () {
    document.location.hash = dataToHash(this.title, this.items)
  }
}

// eslint-disable-next-line no-new
new App()
