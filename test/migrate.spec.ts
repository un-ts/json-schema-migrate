import { jest } from '@jest/globals'
import { Ajv2019 as Ajv } from 'ajv/dist/2019.js'

import { draft7, draft2019, draft2020, getAjv } from '../src/index.js'

import expectedSchemaDraft7 from './fixtures/expected-schema-from-draft-04-to-07.json'
import expectedSchemaDraft2019 from './fixtures/expected-schema-from-draft-04-to-2019.json'
import expectedSchemaDraft2020 from './fixtures/expected-schema-from-draft-04-to-2020.json'
import schemaDraft4 from './fixtures/schema-draft-04.json'

describe('migrate to draft-07 schema', () => {
  it('should migrate from draft-04 schema to draft-07 schema', () => {
    const schema = structuredClone(schemaDraft4)
    draft7(schema)
    expect(schema).toEqual(expectedSchemaDraft7)
    const ajv = getAjv()
    expect(ajv).toBeInstanceOf(Ajv)
    expect(ajv).toBe(getAjv())
  })

  it('should migrate from draft-04 schema to draft-2019-09 schema', () => {
    const schema = structuredClone(schemaDraft4)
    draft2019(schema)
    expect(schema).toEqual(expectedSchemaDraft2019)
  })

  it('should migrate from draft-04 schema to draft-2020-12 schema', () => {
    const schema = structuredClone(schemaDraft4)
    draft2020(schema)
    expect(schema).toEqual(expectedSchemaDraft2020)
  })

  describe('invalid schemas', () => {
    it('should throw if id is not a string', () => {
      expect(() =>
        draft7({
          // @ts-expect-error -- intended
          id: 1,
        }),
      ).toThrow()
    })

    it('should throw if id has many #s', () => {
      expect(() => draft2019({ id: 'schema#for#bar' })).toThrow()
    })

    it('should warn on non-boolean `exclusiveMaximum`', () => {
      const { warn } = console
      console.warn = jest.fn()
      draft7({
        type: 'number',
        exclusiveMaximum: 'true',
      })
      expect(console.warn).toHaveBeenCalledTimes(1)
      expect(console.warn).toHaveBeenCalledWith(
        'exclusiveMaximum is not boolean',
      )
      console.warn = warn
    })
  })
})
