import type { AnySchemaObject, SchemaObject, ValidateFunction } from 'ajv'

import { getAjv } from './ajv.js'
import {
  DRAFT_2020_SCHEMA,
  DRAFT_2019_SCHEMA,
  DRAFT_7_SCHEMA,
} from './constants.js'
import type { SchemaVersion } from './types.js'

export function constantResultSchema(
  schema: AnySchemaObject,
): boolean | undefined {
  const keys = Object.keys(schema)
  if (keys.length === 0) {
    return true
  }
  if (keys.length === 1 && keys[0] === 'not') {
    const valid = constantResultSchema(schema.not as AnySchemaObject)
    if (typeof valid == 'boolean') {
      return !valid
    }
  }
}

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

export function metaSchema(version: SchemaVersion) {
  switch (version) {
    case 'draft7': {
      return DRAFT_7_SCHEMA
    }
    case 'draft2019': {
      return DRAFT_2019_SCHEMA
    }
    case 'draft2020': {
      return DRAFT_2020_SCHEMA
    }
  }
}
