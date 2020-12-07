
import test from 'ava'
import { Item } from '../src/models.js'
import { dataToHash, hashToData } from '../src/utils.js'

const expectedItems = [new Item({ title: 'have fun', done: false }), new Item({ title: 'avoid shitty job', done: true })]

test('get title & items from hash', t => {
  const data = hashToData('#My%20great%20goals=have%20fun,!avoid%20shitty%20job')
  const expected = { title: 'My great goals', items: expectedItems }
  t.deepEqual(data, expected)
})

test('get default title & items from hash', t => {
  const data = hashToData('#have%20fun,!avoid%20shitty%20job')
  const expected = { title: '', items: expectedItems }
  t.deepEqual(data, expected)
})

test('get default title & empty items from faulty hash', t => {
  const data = hashToData('')
  const expected = { title: '', items: [] }
  t.deepEqual(data, expected)
})

test('data to hash', t => {
  const data = { title: 'My super tasks', items: expectedItems }
  const expected = '#My%20super%20tasks=have%20fun,!avoid%20shitty%20job'
  t.deepEqual(dataToHash(data.title, data.items), expected)
})
