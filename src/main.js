
import { Item } from './models.js'
import { dataToHash, hashToData } from './utils.js'

export const DEFAULT_TITLE = 'Goals'
export const DEFAULT_ITEMS = ['This is some default goals', 'Become a ninja', 'Eat lots of pastas'].map((title, index) => new Item({ title, done: (index === 1) }))

class App {
  constructor () {
    this.items = []
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
    this.els.list.addEventListener('click', this.onListClick.bind(this))
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

  onListClick (event) {
    const element = event.target
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

window.app = new App()
