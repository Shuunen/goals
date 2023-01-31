
import { check, checksRun } from 'shuutils'
import { Item } from '../src/models'
import { dataToHash, hashToData } from '../src/utils'

const expectedItems = [new Item('have fun', false), new Item('avoid shitty job', true)]

check('hashToData A get title & items from hash', hashToData('#My%20great%20goals=have%20fun,!avoid%20shitty%20job'), { title: 'My great goals', items: expectedItems })
check('hashToData B get default title & items from hash', hashToData('#have%20fun,!avoid%20shitty%20job'), { title: '', items: expectedItems })
check('hashToData C get default title & empty items from faulty hash', hashToData(''), { title: '', items: [] })
check('hashToData D', hashToData('#'), { title: '', items: [] })
check('hashToData E', hashToData('#='), { title: '', items: [] })

check('dataToHash A', dataToHash('My super tasks', expectedItems), '#My%20super%20tasks=have%20fun,!avoid%20shitty%20job')

checksRun()
