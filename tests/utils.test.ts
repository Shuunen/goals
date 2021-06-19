
import { deepStrictEqual } from 'assert'
import { Item } from '../src/models'
import { dataToHash, hashToData } from '../src/utils'

describe('utils', function () {

  const expectedItems = [new Item('have fun', false), new Item('avoid shitty job', true)]

  it('get title & items from hash', function () {
    const data = hashToData('#My%20great%20goals=have%20fun,!avoid%20shitty%20job')
    const expected = { title: 'My great goals', items: expectedItems }
    deepStrictEqual(data, expected)
  })

  it('get default title & items from hash', function () {
    const data = hashToData('#have%20fun,!avoid%20shitty%20job')
    const expected = { title: '', items: expectedItems }
    deepStrictEqual(data, expected)
  })

  it('get default title & empty items from faulty hash', function () {
    const data = hashToData('')
    const expected = { title: '', items: [] }
    deepStrictEqual(data, expected)
  })

  it('data to hash', function () {
    const data = { title: 'My super tasks', items: expectedItems }
    const expected = '#My%20super%20tasks=have%20fun,!avoid%20shitty%20job'
    deepStrictEqual(dataToHash(data.title, data.items), expected)
  })

})



