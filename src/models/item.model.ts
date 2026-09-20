export type Item = {
  isDone: boolean
  title: string
}

export function createItem(title = '', isDone = false): Item {
  return { isDone, title }
}
