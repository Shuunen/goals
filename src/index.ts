
import { Item } from './models'
import { dataToHash, hashToData } from './utils'

export const DEFAULT_TITLE = 'Goals'
export const DEFAULT_ITEMS = ['This is some default goals', 'Become a ninja', 'Eat lots of pastas'].map((title, index) => new Item(title, (index === 1)))

class App {
  els: Record<string, HTMLElement> = {}
  items: Item[] = []
  title = ''

  constructor () {
    this.setupElements()
    this.setupListeners()
    this.checkDataSources()
  }

  setupElements () {
    this.els = {
      title: document.querySelector('h1'),
      list: document.querySelector('ul'),
    }
  }

  setupListeners () {
    this.els.list.addEventListener('click', event => this.onListClick(event.target))
  }

  checkDataSources () {
    const { title, items } = hashToData(document.location.hash)
    this.title = title.length > 0 ? title : DEFAULT_TITLE
    this.items = items.length > 0 ? items : DEFAULT_ITEMS
    console.log('detected', this.items.length, 'items :', this.items)
    if (this.items.length > 0) this.render()
  }

  render () {
    this.els.title.textContent = this.title
    this.els.list.innerHTML = this.items.map((item, index) => `<li>
      <label class="item ${item.done ? 'done' : ''}">
        <input type=checkbox ${item.done ? 'checked' : ''} value=${index}>
        <span class=title>${item.title}</span>
      </label>
    </li>`).join('\n')
  }

  onListClick (element) {
    if (element.tagName !== 'INPUT') return
    const done = element.checked
    const index = element.value
    this.items[index].done = done
    this.render()
    this.updateUrl()
  }

  updateUrl () {
    document.location.hash = dataToHash(this.title, this.items)
  }
}

new App()
