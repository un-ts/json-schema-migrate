import assert from 'node:assert'

import { Ajv } from 'ajv'

import { draft2019, draft2020, draft7, getAjv } from '../src/index.js'

import expectedSchemaDraft7 from './fixtures/expected-schema-from-draft-04-to-07.json'
import expectedSchemaDraft2019 from './fixtures/expected-schema-from-draft-04-to-2019.json'
import expectedSchemaDraft2020 from './fixtures/expected-schema-from-draft-04-to-2020.json'
import schemaDraft4 from './fixtures/schema-draft-04.json'

describe('migrate to draft-07 schema', () => {
  it('should migrate from draft-04 schema to draft-07 schema', () => {
    const schema = structuredClone(schemaDraft4)
    draft7(schema)
    assert.deepStrictEqual(schema, expectedSchemaDraft7)
    const ajv = getAjv()
    assert.ok(ajv instanceof Ajv)
    assert.strictEqual(ajv, getAjv())
  })

  it('should migrate from draft-04 schema to draft-2019-09 schema', () => {
    const schema = structuredClone(schemaDraft4)
    draft2019(schema)
    assert.deepStrictEqual(schema, expectedSchemaDraft2019)
  })

  it('should migrate from draft-04 schema to draft-2020-12 schema', () => {
    const schema = structuredClone(schemaDraft4)
    draft2020(schema)
    assert.deepStrictEqual(schema, expectedSchemaDraft2020)
  })

  describe('invalid schemas', () => {
    it('should throw if id is not a string', () => {
      assert.throws(() =>
        draft7({
          // @ts-expect-error -- intended
          id: 1,
        }),
      )
    })

    it('should throw if id has many #s', () => {
      assert.throws(() => draft2019({ id: 'schema#for#bar' }))
    })
  })
})
