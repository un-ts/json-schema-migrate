import { cjsRequire } from '@pkgr/core'
import Ajv7, { type SchemaObject } from 'ajv'
import Ajv2019 from 'ajv/dist/2019.js'
import Ajv2020 from 'ajv/dist/2020.js'
import type AjvCore from 'ajv/dist/core.js'
import AjvJTD from 'ajv/dist/jtd.js'
import jtd from 'ajv/dist/refs/jtd-schema.js'
import Ajv4 from 'ajv-draft-04'

import type { SchemaVersion } from './types.js'

const draft04 = cjsRequire<SchemaObject>(
  'ajv-draft-04/dist/refs/json-schema-draft-04.json',
)
const draft06 = cjsRequire<SchemaObject>(
  'ajv/dist/refs/json-schema-draft-06.json',
)
const draft07 = cjsRequire<SchemaObject>(
  'ajv/dist/refs/json-schema-draft-07.json',
)
const draft2019_09 = cjsRequire<SchemaObject>(
  'ajv/dist/refs/json-schema-2019-09/schema.json',
)
const draft2020_12 = cjsRequire<SchemaObject>(
  'ajv/dist/refs/json-schema-2020-12/schema.json',
)

const AjvClass: Record<SchemaVersion, typeof AjvCore> = {
  jtd: AjvJTD,
  draft4: Ajv4,
  draft7: Ajv7,
  draft2019: Ajv2019,
  draft2020: Ajv2020,
}

export const getAjvByVersion = (version?: SchemaVersion): AjvCore => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const Ajv = (version && AjvClass[version]) || Ajv7
  const ajv = new Ajv({ allErrors: true })

  switch (version) {
    case 'draft4': {
      ajv.addMetaSchema(draft06)
      ajv.addMetaSchema(draft07)
      ajv.addMetaSchema(draft2019_09)
      ajv.addMetaSchema(draft2020_12)
      ajv.addMetaSchema(jtd)
      break
    }
    case 'draft7': {
      ajv.addMetaSchema(draft04)
      ajv.addMetaSchema(draft06)
      ajv.addMetaSchema(draft2019_09)
      ajv.addMetaSchema(draft2020_12)
      ajv.addMetaSchema(jtd)
      break
    }
    case 'draft2019': {
      ajv.addMetaSchema(draft04)
      ajv.addMetaSchema(draft06)
      ajv.addMetaSchema(draft07)
      ajv.addMetaSchema(draft2020_12)
      ajv.addMetaSchema(jtd)
      break
    }
    case 'draft2020': {
      ajv.addMetaSchema(draft04)
      ajv.addMetaSchema(draft06)
      ajv.addMetaSchema(draft07)
      ajv.addMetaSchema(draft2019_09)
      ajv.addMetaSchema(jtd)
      break
    }
    case 'jtd': {
      ajv.addMetaSchema(draft04)
      ajv.addMetaSchema(draft06)
      ajv.addMetaSchema(draft07)
      ajv.addMetaSchema(draft2019_09)
      ajv.addMetaSchema(draft2020_12)
      break
    }
  }

  return ajv
}
