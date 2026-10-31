import { createItem } from '../models/item.model'
import { fileName, maxImportedGoals, parseImport, toJson, toMarkdown } from './goals-file.utils'

const items = [createItem('buy milk', false), createItem("café l'été", true)]
const summary = (text: string) => parseImport(text).items.map(item => `${item.isDone ? 'x' : 'o'} ${item.title}`)

describe('export', () => {
  it('export A json has a version, the title and every goal', () => {
    expect(JSON.parse(toJson('Mine', items))).toStrictEqual({
      items: [
        { isDone: false, title: 'buy milk' },
        { isDone: true, title: "café l'été" },
      ],
      title: 'Mine',
      version: 1,
    })
  })

  it('export B markdown is a checklist under the title', () => {
    expect(toMarkdown('Mine', items)).toBe("# Mine\n\n- [ ] buy milk\n- [x] café l'été\n")
  })

  it('export C the file name is a slug of the title', () => {
    expect(fileName('Mes Objectifs 2026 !')).toBe('goals-mes-objectifs-2026.json')
    expect(fileName('Café Été')).toBe('goals-cafe-ete.json')
    expect(fileName('🎉')).toBe('goals-list.json')
  })
})

describe('parseImport', () => {
  it('parseImport A reads back what json export wrote', () => {
    const parsed = parseImport(toJson('Mine', items))
    expect(parsed.title).toBe('Mine')
    expect(parsed.items).toStrictEqual(items)
  })

  it('parseImport B reads back what markdown export wrote', () => {
    const parsed = parseImport(toMarkdown('Mine', items))
    expect(parsed.title).toBe('Mine')
    expect(parsed.items).toStrictEqual(items)
  })

  it('parseImport C plain lines have no title', () => {
    const parsed = parseImport('a\n- b\n\n3) c')
    expect(parsed.title).toBeUndefined()
    expect(summary('a\n- b\n\n3) c')).toStrictEqual(['o a', 'o b', 'o c'])
  })

  it('parseImport D json can be a bare array of strings or objects, other entries are dropped', () => {
    expect(summary('[ "a", {"title":"b","isDone":true}, 5, null, {"title":3}, "  ", {"isDone":true} ]')).toStrictEqual(['o a', 'x b'])
  })

  it('parseImport E broken or unexpected json finds nothing, without throwing', () => {
    expect(parseImport('{ nope').items).toStrictEqual([])
    expect(parseImport('{"items": "a"}').items).toStrictEqual([])
    expect(parseImport('{"title":"x"}').items).toStrictEqual([])
    expect(parseImport('').items).toStrictEqual([])
  })

  it('parseImport F json titles & goals are sanitized, a blank title is no title', () => {
    const parsed = parseImport(String.raw`{"title":"  \n ","items":["  a\tb\u0000c "]}`)
    expect(parsed.title).toBeUndefined()
    expect(parsed.items[0]?.title).toBe('a b c')
    expect(parseImport('{"title":" T ","items":["a"]}').title).toBe('T')
  })

  it('parseImport G keeps the first 500 goals and says it cut', () => {
    const many = Array.from({ length: maxImportedGoals + 20 }, (_unused, index) => `goal ${index}`).join('\n')
    const parsed = parseImport(many)
    expect(parsed.items).toHaveLength(maxImportedGoals)
    expect(parsed.isTruncated).toBe(true)
    expect(parseImport('a\nb').isTruncated).toBe(false)
  })

  it('parseImport H a markdown title alone is a title without goals', () => {
    const parsed = parseImport('# Only a title')
    expect(parsed.title).toBe('Only a title')
    expect(parsed.items).toStrictEqual([])
  })
})
