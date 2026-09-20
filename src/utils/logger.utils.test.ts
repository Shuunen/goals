import { logger } from './logger.utils'

describe('logger', () => {
  it('logger A default options', () => {
    expect(logger.options).toMatchInlineSnapshot(`
      {
        "isActive": true,
        "minimumLevel": "3-info",
        "willLogDate": false,
        "willLogDelay": true,
        "willLogTime": false,
        "willOutputToConsole": true,
        "willOutputToMemory": false,
      }
    `)
  })
})
