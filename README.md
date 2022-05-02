[![Test Coverage](https://api.codeclimate.com/v1/badges/d28d1f8e89ae26ed6055/test_coverage)](https://codeclimate.com/github/flexper/unify-mercurius/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/d28d1f8e89ae26ed6055/maintainability)](https://codeclimate.com/github/flexper/unify-mercurius/maintainability)
![npm](https://img.shields.io/npm/v/unify-mercurius) ![npm](https://img.shields.io/npm/dm/unify-mercurius) ![Snyk Vulnerabilities for npm package](https://img.shields.io/snyk/vulnerabilities/npm/unify-mercurius) ![NPM](https://img.shields.io/npm/l/unify-mercurius)
# Unify Mercurius

A Mercurius plugin wrapping [unify-errors](https://github.com/flexper/unify-errors) to handle REST errors

## Install

```sh
npm i unify-mercurius
# Or
yarn add unify-mercurius
# Or
pnpm add unify-mercurius
```

## Use

```javascript
'use strict'

const Fastify = require('fastify')
const mercurius = require('mercurius')
const { unifyMercuriusErrorFormatter } = require('unify-mercurius')

const app = Fastify()

const schema = `
  type Query {
    add(x: Int, y: Int): Int
  }
`

const resolvers = {
  Query: {
    add: async (_, { x, y }) => x + y
  }
}

app.register(mercurius, {
  schema,
  resolvers,
  errorFormatter: unifyMercuriusErrorFormatter()
})

app.get('/', async function (req, reply) {
  const query = '{ add(x: 2, y: 2) }'
  return reply.graphql(query)
})

app.listen(3000)

```

## Plugin options

| name                | default | description                                                                                   |
| ------------------- | ------- | --------------------------------------------------------------------------------------------- |
| _hideContextOnProd_ | false   | If **NODE_ENV** is set to 'production', will remove the 'context' key from the error response |

## Tests

To execute jest tests (all errors, type integrity test)

```bash
pnpm test
```

## Maintain

This package use [TSdx](https://github.com/jaredpalmer/tsdx). Please check documentation to update this package.
