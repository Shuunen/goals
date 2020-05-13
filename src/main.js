
import { Item } from './models.js'
import { dataFromHash } from './utils.js'

export const DEFAULT_TITLE = 'Goals'
export const DEFAULT_ITEMS = ['This is some default goals', 'Become a ninja', 'Eat lots of pastas'].map((title, index) => new Item({ title, done: (index === 1) }))

class App {
  get editActive () {
    return this.els.editBtn.classList.contains('active')
  }

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
      sheet: document.querySelector('.sheet'),
      editBtn: document.querySelector('button.edit')
    }
  }

  setupListeners () {
    this.els.list.addEventListener('click', this.onListClick.bind(this))
    this.els.editBtn.addEventListener('click', this.toggleEdit.bind(this))
    document.addEventListener('keydown', this.onKeyDown.bind(this))
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
    if (this.editActive) return event.preventDefault()
    const el = event.target
    if (el.tagName !== 'INPUT') return
    const done = el.checked
    const index = el.value
    this.items[index].done = done
    this.render()
    this.updateUrl()
  }

  onKeyDown (event) {
    if (!event.ctrlKey || event.key !== 'e') return
    event.preventDefault()
    this.toggleEdit()
  }

  toggleEdit () {
    this.els.editBtn.classList.toggle('active')
    this.els.sheet.classList.toggle('editing', this.editActive)
    this.els.sheet.contentEditable = this.editActive
  }

  updateUrl () {
    document.location.hash = `${this.title}=${this.items.map(i => `${i.done ? '!' : ''}${i.title}`).join(',')}`
  }
}

window.app = new App()
