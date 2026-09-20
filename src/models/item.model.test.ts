import { createItem } from './item.model'

describe('createItem', () => {
  it('createItem A default title is empty and not done', () => {
    expect(createItem()).toMatchInlineSnapshot(`
      {
        "isDone": false,
        "title": "",
      }
    `)
  })

  it('createItem B with title and done state', () => {
    expect(createItem('have fun', true)).toMatchInlineSnapshot(`
      {
        "isDone": true,
        "title": "have fun",
      }
    `)
  })
})
