
import { deepStrictEqual } from 'assert'
import { Item } from '../src/models'

describe('models', function () {

  it('item default title is empty and not done', function () {
    const item = new Item()
    const expected = new Item('', false)
    deepStrictEqual(item, expected)
  })

})

