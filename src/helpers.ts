import type { AnySchemaObject, SchemaObject, ValidateFunction } from 'ajv'

import { getAjv } from './ajv.js'
import { metaSchema } from './common.js'
import { DRAFT_2020_SCHEMA, DRAFT_2019_SCHEMA } from './constants.js'
import type { SchemaVersion } from './types.js'

export function getMigrateSchema(version: SchemaVersion): SchemaObject {
  const isDraft2020 = version === 'draft2020'
  const schema = isDraft2020 ? DRAFT_2020_SCHEMA : DRAFT_2019_SCHEMA
  return {
    $id: `migrateSchema-${version}`,
    $schema: schema,
    allOf: [{ migrateSchema: version }, { $ref: schema }],
    ...(isDraft2020 ? { $dynamicAnchor: 'meta' } : { $recursiveAnchor: true }),
  }
}

export function getMigrate(version: SchemaVersion) {
  let migrate: ValidateFunction | undefined
  return (schema: AnySchemaObject) => {
    migrate ||= getAjv(version).compile(getMigrateSchema(version))
    migrate(schema)
    schema.$schema ||= metaSchema(version)
  }
}
