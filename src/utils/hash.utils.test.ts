import { createItem } from '../models/item.model'
import { dataToHash, hashToData, sanitizeText, writeHashSetting } from './hash.utils'

const items = [createItem('have fun', false), createItem('avoid shitty job', true)]

describe('hashToData', () => {
  it('hashToData A get title & items from hash', () => {
    expect(hashToData('#My%20great%20goals=have%20fun,!avoid%20shitty%20job')).toMatchInlineSnapshot(`
      {
        "items": [
          {
            "isDone": false,
            "title": "have fun",
          },
          {
            "isDone": true,
            "title": "avoid shitty job",
          },
        ],
        "settings": {},
        "title": "My great goals",
      }
    `)
  })

  it('hashToData B get default title & items from hash', () => {
    expect(hashToData('#have%20fun,!avoid%20shitty%20job')).toMatchInlineSnapshot(`
      {
        "items": [
          {
            "isDone": false,
            "title": "have fun",
          },
          {
            "isDone": true,
            "title": "avoid shitty job",
          },
        ],
        "settings": {},
        "title": "",
      }
    `)
  })

  it('hashToData C empty faulty hash', () => {
    expect(hashToData('')).toMatchInlineSnapshot(`
      {
        "items": [],
        "settings": {},
        "title": "",
      }
    `)
  })

  it('hashToData D empty hash', () => {
    expect(hashToData('#')).toMatchInlineSnapshot(`
      {
        "items": [],
        "settings": {},
        "title": "",
      }
    `)
  })

  it('hashToData E empty faulty hash with equal', () => {
    expect(hashToData('#=')).toMatchInlineSnapshot(`
      {
        "items": [],
        "settings": {},
        "title": "",
      }
    `)
  })
})

describe('dataToHash', () => {
  it('dataToHash A', () => {
    expect(dataToHash('My super tasks', items)).toMatchInlineSnapshot('"#My%20super%20tasks=have%20fun,!avoid%20shitty%20job"')
  })
})

describe('sanitizeText', () => {
  it('sanitizeText A strips unsupported chars and extra spaces', () => {
    expect(sanitizeText('  hello,   world! = ok ')).toBe('hello world ok')
  })
})

describe('settings in the hash', () => {
  it('settings A hashToData reads the settings after the goals', () => {
    expect(hashToData('#My%20goals=have%20fun&theme=dark&font=jetbrains-mono').settings).toStrictEqual({ font: 'jetbrains-mono', theme: 'dark' })
  })

  it('settings B hashToData reads settings even without goals', () => {
    expect(hashToData('#&theme=dark')).toStrictEqual({ items: [], settings: { theme: 'dark' }, title: '' })
  })

  it('settings C dataToHash writes the settings after the goals', () => {
    expect(dataToHash('My goals', items, { theme: 'dark' })).toBe('#My%20goals=have%20fun,!avoid%20shitty%20job&theme=dark')
  })

  it('settings D dataToHash writes only the settings when there are no goals', () => {
    expect(dataToHash('', [], { theme: 'dark' })).toBe('#&theme=dark')
  })

  it('settings E writeHashSetting adds or replaces a setting and keeps the goals', () => {
    document.location.hash = '#t=a,!b&theme=dark'
    writeHashSetting('font', 'lora')
    writeHashSetting('theme', 'rose')
    expect(document.location.hash).toBe('#t=a,!b&theme=rose&font=lora')
  })
})
