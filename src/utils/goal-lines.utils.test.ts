import { parseGoalLines } from './goal-lines.utils'

const summary = (text: string) => parseGoalLines(text).map(item => `${item.isDone ? 'x' : 'o'} ${item.title}`)

describe('parseGoalLines', () => {
  it('parseGoalLines A plain lines, empty ones dropped, windows line breaks', () => {
    expect(summary('a\r\n\r\n  b  \n\n')).toStrictEqual(['o a', 'o b'])
  })

  it('parseGoalLines B list prefixes are stripped', () => {
    expect(summary('- a\n* b\n• c\n1. d\n2) e\n12. f')).toStrictEqual(['o a', 'o b', 'o c', 'o d', 'o e', 'o f'])
  })

  it('parseGoalLines C checkboxes set the done state, with or without a list prefix', () => {
    expect(summary('- [x] a\n- [X] b\n- [ ] c\n[x] d\n[ ] e')).toStrictEqual(['x a', 'x b', 'o c', 'x d', 'o e'])
  })

  it('parseGoalLines D keeps punctuation, accents & a dash inside the text', () => {
    expect(summary("café l'été ? - ok\n-no prefix")).toStrictEqual(["o café l'été ? - ok", 'o -no prefix'])
  })

  it('parseGoalLines E a line with only a prefix or a box is dropped', () => {
    expect(summary('- \n[x]\n1.')).toStrictEqual([])
  })
})
