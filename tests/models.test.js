
import test from 'ava'
import { Item } from '../src/models.js'

test('item default title is empty and not done', t => {
  const item = new Item({})
  const expected = new Item({ title: '', done: false })
  t.deepEqual(item, expected)
})
