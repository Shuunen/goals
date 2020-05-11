
import { Item } from './models.js'
import { dataFromHash } from './utils.js'

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
      list: document.querySelector('ul')
    }
  }

  setupListeners () {
    this.els.list.onclick = this.onListClick.bind(this)
  }

  checkDataSources () {
    const { title, items } = dataFromHash(document.location.hash)
    this.title = title.length ? title : DEFAULT_TITLE
    this.items = items.length ? items : DEFAULT_ITEMS
    console.log('detected', this.items.length, 'items :', this.items)
    if (this.items.length) this.render()
  }

  byDone (a) {
    return a.done ? 1 : -1
  }

  render () {
    this.els.title.textContent = this.title
    this.els.list.innerHTML = this.items.sort(this.byDone).map((item, index) => `
    <li>
      <label class="item ${item.done ? 'done' : ''}">
        <input type=checkbox ${item.done ? 'checked' : ''} value=${index}>
        <span class=title>${item.title}</span>
      </label>
    </li>`).join('\n')
  }

  onListClick (event) {
    const el = event.target
    if (el.tagName !== 'INPUT') return
    const done = el.checked
    const index = el.value
    this.items[index].done = done
    this.render()
    this.updateUrl()
  }

  updateUrl () {
    document.location.hash = `${this.title}=${this.items.map(i => `${i.done ? '!' : ''}${i.title}`).join(',')}`
  }
}

window.app = new App()
