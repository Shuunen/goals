import { expect, it } from 'vitest'
import { logger } from '../src/logger'

it('logger', () => {
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
