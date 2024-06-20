// eslint-disable-next-line no-restricted-syntax
export class Item {

  public title = ''

  public isDone = false

  public constructor (title = '', isDone = false) {
    this.title = title
    this.isDone = isDone
  }
}
