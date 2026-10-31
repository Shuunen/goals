import { createItem } from '../models/item.model'
import { dataToHash, hashToData, replaceHash, sanitizeText, writeHashSetting } from './hash.utils'

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
  it('sanitizeText A keeps punctuation & accents, collapses spaces', () => {
    expect(sanitizeText("  café   l'été ?  ")).toBe("café l'été ?")
  })

  it('sanitizeText B turns control chars & line breaks into spaces', () => {
    expect(sanitizeText('a\nb\u0000c\td')).toBe('a b c d')
  })

  it('sanitizeText C normalizes unicode to NFC', () => {
    expect(sanitizeText('e\u0301')).toBe('\u00E9')
  })

  it('sanitizeText D gives nothing for blank text', () => {
    expect(sanitizeText(' \n\u0000 ')).toBe('')
  })
})

describe('any text in the hash', () => {
  const texts = ["café l'été ?", 'a,b', 'a&b=c', '!bang', '100%', '#tag', '🎉 party', '日本語', 'spaced out']

  it.each(texts)('round trip A title & item "%s"', text => {
    const data = { items: [createItem(text, false), createItem(text, true)], settings: {}, title: text }
    expect(hashToData(dataToHash(data.title, data.items))).toStrictEqual(data)
  })

  it('round trip B settings', () => {
    expect(hashToData(dataToHash('t', [], { odd: 'a&b=c d' })).settings).toStrictEqual({ odd: 'a&b=c d' })
  })

  it('round trip C empty list keeps its title', () => {
    expect(hashToData(dataToHash('Mine', []))).toStrictEqual({ items: [], settings: {}, title: 'Mine' })
  })

  it('escapes the done marker of a text starting with it', () => {
    expect(dataToHash('t', [createItem('!bang')])).toBe('#t=%21bang')
  })

  it('legacy A the readme demo link loads as before', () => {
    const { items: loaded, settings, title } = hashToData('#My%20goals=become%20a%20ninja,buy%20milk,!eat%20lots%20of%20pastas,find%20goals%20ideas,number%20five&something_else=12')
    expect(title).toBe('My goals')
    expect(loaded.map(item => [item.title, item.isDone])).toStrictEqual([
      ['become a ninja', false],
      ['buy milk', false],
      ['eat lots of pastas', true],
      ['find goals ideas', false],
      ['number five', false],
    ])
    expect(settings).toStrictEqual({ something_else: '12' })
  })

  it('legacy B a link with raw spaces & no title loads as before', () => {
    expect(hashToData('#have fun,!avoid shitty job').items.map(item => item.title)).toStrictEqual(['have fun', 'avoid shitty job'])
  })

  it('malformed A a broken escape sequence does not crash', () => {
    expect(hashToData('#t=%E0%A4%A,ok').items.map(item => item.title)).toStrictEqual(['%E0%A4%A', 'ok'])
  })

  it('empty A a title without items stays a title', () => {
    expect(hashToData('#Mine=')).toStrictEqual({ items: [], settings: {}, title: 'Mine' })
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

describe('replaceHash', () => {
  it('replaceHash A changes the hash without a new history entry', () => {
    document.location.hash = '#a=b'
    const before = globalThis.history.length
    replaceHash('#c=d')
    expect(document.location.hash).toBe('#c=d')
    expect(globalThis.history).toHaveLength(before)
  })

  it('replaceHash B leaves the same hash alone', () => {
    document.location.hash = '#a=b'
    replaceHash('#a=b')
    expect(document.location.hash).toBe('#a=b')
  })
})
