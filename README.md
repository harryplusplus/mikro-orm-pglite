# MikroORM PGlite Driver

[![test](https://github.com/harryplusplus/mikro-orm-pglite/actions/workflows/test.yml/badge.svg)](https://github.com/harryplusplus/mikro-orm-pglite/actions/workflows/test.yml)
[![npm version](https://img.shields.io/npm/v/mikro-orm-pglite)](https://www.npmjs.com/package/mikro-orm-pglite)
[![npm downloads](https://img.shields.io/npm/dm/mikro-orm-pglite)](https://www.npmjs.com/package/mikro-orm-pglite)

A driver for using [PGlite](https://pglite.dev/) with [MikroORM](https://mikro-orm.io/).

## Table of Contents

<!-- toc -->

- [Language](#language)
- [Installation](#installation)
- [Usage](#usage)
  - [Easy initialization](#easy-initialization)
  - [Injecting a PGlite instance](#injecting-a-pglite-instance)
- [API](#api)
  - [`connection`](#connection)
    - [`pglite`](#pglite)
- [License](#license)

<!-- tocstop -->

## Language

- [English](/README.md)
- [한국어](/README.ko.md)

## Installation

Install with the following commands.

```sh
# using npm
npm install @electric-sql/pglite @mikro-orm/postgresql mikro-orm-pglite
# using pnpm
pnpm add @electric-sql/pglite @mikro-orm/postgresql mikro-orm-pglite
```

> [!WARNING]  
> [Yarn](https://yarnpkg.com/) and [Bun](https://bun.com/) environments have not been tested yet for compatibility.

## Usage

### Easy initialization

Configure the `driver` property of `MikroORM.init` parameters to `PGliteDriver`.

The example below shows an easy initialization method.

```typescript
import { MikroORM } from "@mikro-orm/core";
import { PGliteDriver } from "mikro-orm-pglite";

const orm = await MikroORM.init({
  driver: PGliteDriver,
  dbName: "postgres",
});

await orm.close();
```

> [!WARNING]  
> The `dbName` property must be configured.

<!-- MD028/no-blanks-blockquote -->

> [!NOTE]  
> Please read the documentation below for more information on how to configure MikroORM.
>
> - [Initializing the ORM](https://mikro-orm.io/docs/guide/first-entity#initializing-the-orm)
> - [Configuration](https://mikro-orm.io/docs/configuration)
> - [Running MikroORM.init() without arguments](https://mikro-orm.io/docs/quick-start#running-mikroorminit-without-arguments)
> - [Using MikroORM with NestJS framework](https://mikro-orm.io/docs/usage-with-nestjs)

### Injecting a PGlite instance

When using the [Easy initialization](#easy-initialization) method, the PGlite instance is initialized using the In-memory ephemeral storage method.
Additionally, the PGlite instance becomes **owned** by the MikroORM instance.
In other words, the PGlite instance shares its lifecycle with the MikroORM instance.

For PGlite instances with In-memory ephemeral storage, sharing the lifecycle with a MikroORM instance may not meet your needs depending on your use case.
You may also want to initialize it in a File system storage fashion or take advantage of the various parameters of the PGlite constructor.

Configure the `driverOptions.connection.pglite` property to a synchronous or asynchronous function that returns a PGlite instance.
In this case, MikroORM considers the PGlite instance as **borrowed**.
In other words, MikroORM does not manage the creation and destruction of PGlite instances, since it delegates the lifecycle of PGlite instances to an external entity.

The example below shows how to inject a PGlite instance.

```typescript
import { PGlite } from "@electric-sql/pglite";
import { MikroORM } from "@mikro-orm/core";
import { PGliteConnectionConfig, PGliteDriver } from "mikro-orm-pglite";

const pglite = new PGlite();

const orm = await MikroORM.init({
  driver: PGliteDriver,
  dbName: "postgres",
  driverOptions: {
    connection: {
      pglite: () => pglite,
    } satisfies PGliteConnectionConfig,
  },
});

await orm.close();

await pglite.close();
```

## API

Configure the following properties from the parameters of the `driverOptions` property:

### `connection`

The type of the `connection` property is:

```typescript
export interface PGliteConnectionConfig {
  pglite?: PGliteProvider;
}
```

The following are the properties for configuring `connection`.

#### `pglite`

The type of the `pglite` property is:

```typescript
export interface PGliteProvider {
  (): MaybePromise<PGlite>; // (): PGlite | Promise<PGlite>
}
```

> [!NOTE]  
> To learn more about PGlite's various features, please read the [PGlite API](https://pglite.dev/docs/api) documentation.

## License

MIT
