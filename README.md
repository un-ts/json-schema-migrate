# @unts/json-schema-migrate

[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/un-ts/json-schema-migrate/ci.yml?branch=master)](https://github.com/un-ts/json-schema-migrate/actions/workflows/ci.yml?query=branch%3Amaster)
[![Codecov](https://img.shields.io/codecov/c/github/un-ts/json-schema-migrate.svg)](https://codecov.io/gh/un-ts/json-schema-migrate)
[![type-coverage](https://img.shields.io/badge/dynamic/json.svg?label=type-coverage&prefix=%E2%89%A5&suffix=%&query=$.typeCoverage.atLeast&uri=https%3A%2F%2Fraw.githubusercontent.com%2Fun-ts%2Fjson-schema-migrate%2Fmaster%2Fpackage.json)](https://github.com/plantain-00/type-coverage)
[![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/un-ts/json-schema-migrate)](https://coderabbit.ai)
[![npm](https://img.shields.io/npm/v/@unts/json-schema-migrate.svg)](https://www.npmjs.com/package/@unts/json-schema-migrate)
[![GitHub Release](https://img.shields.io/github/release/un-ts/json-schema-migrate)](https://github.com/un-ts/json-schema-migrate/releases)

[![Conventional Commits](https://img.shields.io/badge/conventional%20commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![Renovate enabled](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Code Style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

Migrate JSON-Schema from `draft-04` to `draft-07`, `draft-2019-09` or `draft-2020-12`

## Install

```sh
# npm
npm install @unts/json-schema-migrate

# yarn
yarn add @unts/json-schema-migrate

# pnpm
pnpm add @unts/json-schema-migrate

# bun
bun add @unts/json-schema-migrate
```

## Usage

```js
import * as migrate from '@unts/json-schema-migrate'

const schema = {
  id: 'my-schema',
  minimum: 1,
  exclusiveMinimum: true,
}

migrate.draft7(schema)
// or migrate.draft2019(schema)
// or migrate.draft2020(schema)

console.log(schema)
// {
//  $id: 'my-schema',
//  exclusiveMinimum: 1
// }
```

You can access Ajv instance that is used to migrate schema using `migrate.getAjv` function:

```js
console.log(migrate.getAjv().errorsText(errors))
```

## Changes in schemas after migration

- `id` is replaced with `$id`
- `$schema` value becomes `draft-07`, `draft-2019-09` or `draft-2020-12` meta-schema
- `draft-04` boolean form of `exclusiveMaximum/Minimum` is replaced with the current number form
- `enum` with a single allowed value is replaced with `const`
- Non-standard `constant` is replaced with `const`
- empty schema is replaced with `true`
- schema `{"not":{}}` is replaced with `false`
- `draft2019` function additionally replaces:
  - `dependencies` with `dependentRequired` and `dependentSchemas`
  - `"id": "#foo"` with `"$anchor": "foo"`
  - `"id": "schema#foo"` with `"$id": "schema", "$anchor": "foo"`
- `draft2020` function additionally replaces array form of `items` with `prefixItems` (and `additionalItems` with `items`)

[![Sponsors](https://raw.githubusercontent.com/1stG/static/master/sponsors.svg)](https://github.com/sponsors/JounQin)

## Sponsors

| 1stG                                                                                                                   | RxTS                                                                                                                   | UnTS                                                                                                                   |
| ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| [![1stG Open Collective sponsors](https://opencollective.com/1stG/organizations.svg)](https://opencollective.com/1stG) | [![RxTS Open Collective sponsors](https://opencollective.com/rxts/organizations.svg)](https://opencollective.com/rxts) | [![UnTS Open Collective sponsors](https://opencollective.com/unts/organizations.svg)](https://opencollective.com/unts) |

## Backers

| 1stG                                                                                                                | RxTS                                                                                                                | UnTS                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| [![1stG Open Collective backers](https://opencollective.com/1stG/individuals.svg)](https://opencollective.com/1stG) | [![RxTS Open Collective backers](https://opencollective.com/rxts/individuals.svg)](https://opencollective.com/rxts) | [![UnTS Open Collective backers](https://opencollective.com/unts/individuals.svg)](https://opencollective.com/unts) |

## Changelog

Detailed changes for each release are documented in [CHANGELOG.md](./CHANGELOG.md).

## License

[MIT][] © [JounQin][]@[1stG.me][]

[1stG.me]: https://www.1stG.me
[JounQin]: https://github.com/JounQin
[MIT]: http://opensource.org/licenses/MIT
