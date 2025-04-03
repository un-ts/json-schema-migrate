import type { AnySchemaObject } from 'ajv'

import {
  DRAFT_7_SCHEMA,
  DRAFT_2019_SCHEMA,
  DRAFT_2020_SCHEMA,
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
