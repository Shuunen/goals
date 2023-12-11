import { expect, it } from 'vitest'
import { Item } from '../src/models'
import { dataToHash, hashToData } from '../src/utils'

const items = [new Item('have fun', false), new Item('avoid shitty job', true)]

it('hashToData A get title & items from hash', () => {
  expect(hashToData('#My%20great%20goals=have%20fun,!avoid%20shitty%20job')).toMatchInlineSnapshot(`
    {
      "items": [
        Item {
          "isDone": false,
          "title": "have fun",
        },
        Item {
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
        Item {
          "isDone": false,
          "title": "have fun",
        },
        Item {
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

it('dataToHash A', () => {
  expect(dataToHash('My super tasks', items)).toMatchInlineSnapshot('"#My%20super%20tasks=have%20fun,!avoid%20shitty%20job"')
})

