/* eslint-disable jsdoc/require-jsdoc */
// eslint-disable-next-line no-restricted-syntax
export class Item {

  public isDone = false

  public title = ''

  public constructor (title = '', isDone = false) {
    this.title = title
    this.isDone = isDone
  }
}
