
import { check, checksRun } from 'shuutils'
import { Item } from '../src/models'

const item = new Item()
const expected = new Item('', false)
check('item default title is empty and not done', item, expected)

checksRun()
