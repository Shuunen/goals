
import test from 'ava'
import { Item } from '../src/models.js'
import { dataFromHash } from '../src/utils.js'

const expectedItems = [new Item({ title: 'have fun', done: false }), new Item({ title: 'avoid shitty job', done: true })]

test('get title & items from hash', t => {
  const data = dataFromHash('#My%20great%20goals=have%20fun,!avoid shitty job')
  const expected = { title: 'My great goals', items: expectedItems }
  t.deepEqual(data, expected)
})

test('get default title & items from hash', t => {
  const data = dataFromHash('#have%20fun,!avoid shitty job')
  const expected = { title: '', items: expectedItems }
  t.deepEqual(data, expected)
})

test('get default title & empty items from faulty hash', t => {
  const data = dataFromHash('')
  const expected = { title: '', items: [] }
  t.deepEqual(data, expected)
})
