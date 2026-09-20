import { createItem } from '../models/item.model'
import { dataToHash, hashToData } from './hash.utils'

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
        "title": "",
      }
    `)
  })

  it('hashToData C empty faulty hash', () => {
    expect(hashToData('')).toMatchInlineSnapshot(`
      {
        "items": [],
        "title": "",
      }
    `)
  })

  it('hashToData D empty hash', () => {
    expect(hashToData('#')).toMatchInlineSnapshot(`
      {
        "items": [],
        "title": "",
      }
    `)
  })

  it('hashToData E empty faulty hash with equal', () => {
    expect(hashToData('#=')).toMatchInlineSnapshot(`
      {
        "items": [],
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
