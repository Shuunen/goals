import { createItem } from '../models/item.model'
import { buildShareUrl, isUrlLong } from './url.utils'

describe('isUrlLong', () => {
  it('isUrlLong A warns at 2000 characters and above only', () => {
    expect(isUrlLong(1999)).toBe(false)
    expect(isUrlLong(2000)).toBe(true)
    expect(isUrlLong(5000)).toBe(true)
  })
})

describe('buildShareUrl', () => {
  it('buildShareUrl A is the page with the goals and the current settings', () => {
    document.location.hash = '#old=x&theme=dark'
    const url = buildShareUrl('Mine', [createItem('a b', true)])
    expect(url).toBe(`${document.location.origin}${document.location.pathname}${document.location.search}#Mine=!a%20b&theme=dark`)
  })

  it('buildShareUrl B grows with accents, which escape to six characters each', () => {
    document.location.hash = ''
    expect(buildShareUrl('t', [createItem('éééé')]).length).toBeGreaterThan(buildShareUrl('t', [createItem('eeee')]).length + 19)
  })
})
