/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import type {
  DataValidationCxt,
  SchemaObject,
  AnySchemaObject,
  AnySchema,
  ValidateFunction,
} from 'ajv'
import { Ajv } from 'ajv'

import { getAjvByVersion } from './ajv.js'
import type { SchemaVersion } from './types.js'

export const draft7 = getMigrate('draft7')
export const draft2019 = getMigrate('draft2019')
export const draft2020 = getMigrate('draft2020')

function getMigrateSchema(spec: SchemaVersion): SchemaObject {
  return {
    $id: `migrateSchema-${spec}`,
    $schema: 'https://json-schema.org/draft/2019-09/schema',
    $recursiveAnchor: true,
    allOf: [
      { migrateSchema: spec },
      { $ref: 'https://json-schema.org/draft/2019-09/schema' },
    ],
  }
}

function getMigrate(version: SchemaVersion) {
  let migrate: ValidateFunction | undefined
  return (schema: AnySchemaObject) => {
    migrate ||= getAjv(version).compile(getMigrateSchema(version))
    migrate(schema)
    schema.$schema ||= metaSchema(version)
  }
}

function metaSchema(spec: SchemaVersion): string {
  return spec === 'draft7'
    ? 'http://json-schema.org/draft-07/schema'
    : 'https://json-schema.org/draft/2019-09/schema'
}

const ajvCache = new Map<SchemaVersion, Ajv>()

export function getAjv(version: SchemaVersion = 'draft7'): Ajv {
  let ajv = ajvCache.get(version)

  if (ajv) {
    return ajv
  }

  ajv = getAjvByVersion(version)

  ajv.addKeyword({
    keyword: 'migrateSchema',
    schemaType: 'string',
    modifying: true,
    metaSchema: { enum: ['draft7', 'draft2019', 'draft2020'] },
    // eslint-disable-next-line sonarjs/cognitive-complexity
    validate(
      version: SchemaVersion,
      dataSchema: AnySchema,
      _parentSchema?: AnySchemaObject,
      dataCxt?: DataValidationCxt,
    ) {
      if (typeof dataSchema != 'object') {
        return true
      }

      if (dataCxt) {
        const { parentData, parentDataProperty } = dataCxt
        const valid = constantResultSchema(dataSchema)
        if (typeof valid == 'boolean') {
          parentData[parentDataProperty] = valid
          return true
        }
      }

      const dsCopy = { ...dataSchema }
      for (const key in dsCopy) {
        delete dataSchema[key]
        switch (key) {
          case 'id': {
            const { id } = dsCopy
            if (typeof id !== 'string') {
              throw new TypeError(
                `json-schema-migrate: schema id must be string`,
              )
            }
            if (
              (version === 'draft2019' || version === 'draft2020') &&
              id.includes('#')
            ) {
              const [$id, $anchor, ...rest] = id.split('#')
              if (rest.length > 0) {
                throw new Error(`json-schema-migrate: invalid schema id ${id}`)
              }
              if ($id) dataSchema.$id = $id
              if ($anchor && $anchor !== '/') dataSchema.$anchor = $anchor
            } else {
              dataSchema.$id = id
            }
            break
          }
          case '$schema': {
            const { $schema } = dsCopy
            dataSchema.$schema =
              $schema === 'http://json-schema.org/draft-04/schema#' ||
              $schema === 'http://json-schema.org/draft-04/schema'
                ? metaSchema(version)
                : $schema
            break
          }
          case 'constant': {
            dataSchema.const = dsCopy.constant
            break
          }
          case 'enum': {
            if (
              Array.isArray(dsCopy.enum) &&
              dsCopy.enum.length === 1 &&
              dsCopy.constant === undefined &&
              dsCopy.const === undefined
            ) {
              dataSchema.const = dsCopy.enum[0]
            } else {
              dataSchema.enum = dsCopy.enum
            }
            break
          }
          case 'exclusiveMaximum': {
            migrateExclusive(dataSchema, key, 'maximum')
            break
          }
          case 'exclusiveMinimum': {
            migrateExclusive(dataSchema, key, 'minimum')
            break
          }
          case 'maximum': {
            if (dsCopy.exclusiveMaximum !== true)
              dataSchema.maximum = dsCopy.maximum
            break
          }
          case 'minimum': {
            if (dsCopy.exclusiveMinimum !== true)
              dataSchema.minimum = dsCopy.minimum
            break
          }
          case 'dependencies': {
            const deps = dsCopy.dependencies as Record<string, unknown>
            if (version === 'draft7') {
              dataSchema.dependencies = deps
            } else {
              for (const prop in deps) {
                const kwd = Array.isArray(deps[prop])
                  ? 'dependentRequired'
                  : 'dependentSchemas'
                dataSchema[kwd] ||= {}
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                dataSchema[kwd][prop] = deps[prop]
              }
            }
            break
          }
          case 'items': {
            if (version === 'draft2020' && Array.isArray(dsCopy.items)) {
              dataSchema.prefixItems = dsCopy.items
              if (dsCopy.additionalItems !== undefined) {
                dataSchema.items = dsCopy.additionalItems
              }
            } else {
              dataSchema.items = dsCopy.items
            }
            break
          }
          case 'additionalItems': {
            if (version !== 'draft2020') {
              dataSchema.additionalItems = dsCopy.additionalItems
            }
            break
          }
          default: {
            dataSchema[key] = dsCopy[key]
          }
        }
      }

      return true

      function migrateExclusive(
        schema: AnySchemaObject,
        key: string,
        limit: string,
      ): void {
        if (dsCopy[key] === true) {
          schema[key] = dsCopy[limit]
        } else if (dsCopy[key] !== false && dsCopy[key] !== undefined) {
          ajv!.logger.warn(`${key} is not boolean`)
        }
      }
    },
  })

  ajvCache.set(version, ajv)

  return ajv
}

function constantResultSchema(schema: AnySchema): boolean | undefined {
  if (typeof schema == 'boolean') {
    return schema
  }
  const keys = Object.keys(schema)
  if (keys.length === 0) {
    return true
  }
  if (keys.length === 1 && keys[0] === 'not') {
    const valid = constantResultSchema(schema.not as AnySchema)
    if (typeof valid === 'boolean') {
      return !valid
    }
  }
}
