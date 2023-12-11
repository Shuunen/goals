
import { expect, it } from 'vitest'
import { Item } from '../src/models'

it('item default title is empty and not done', () => {
  expect(new Item()).toMatchInlineSnapshot(`
    Item {
      "isDone": false,
      "title": "",
    }
  `)
})

