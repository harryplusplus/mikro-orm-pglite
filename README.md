# MikroORM PGlite

[PGlite](https://pglite.dev/) driver for [MikroORM](https://mikro-orm.io/).

## Table of Contents

<!-- toc -->

- [Languages](#languages)
- [Installation](#installation)
- [Usage](#usage)
  - [Initialization](#initialization)
    - [Using MikroORM.init](#using-mikroorminit)
    - [NestJS integration](#nestjs-integration)
- [Options](#options)
  - [`onCreateOptions`](#oncreateoptions)
  - [`onClose`](#onclose)
  - [`instance`](#instance)
- [License](#license)

<!-- tocstop -->

## Languages

- [English](/README.md)
- [한국어](/README.ko.md)

## Installation

Install using npm or pnpm:

```sh
# npm
npm install @mikro-orm/core @mikro-orm/postgresql mikro-orm-pglite
# pnpm
pnpm add @mikro-orm/core @mikro-orm/postgresql mikro-orm-pglite
```

> [!WARNING]
> [Yarn](https://yarnpkg.com/) and [Bun](https://bun.com/) have not been tested yet.

## Usage

### Initialization

#### Using MikroORM.init

Just one line below will get you set up for MikroORM with PGlite.

```typescript
import { MikroORM } from "mikro-orm-pglite";

const orm = await MikroORM.init({ ... });
```

When initializing using the `MikroORM` class in the `mikro-orm-pglite` package, there is no need to configure the `driver` property of the `options` parameter.

> [!NOTE]
> For more information on how to configure MikroORM, please read the [Initializing the ORM](https://mikro-orm.io/docs/guide/first-entity#initializing-the-orm) and [Configuration](https://mikro-orm.io/docs/configuration) documents.
> If no parameters are passed, a configuration file is required. For more information about configuration files, see [Running MikroORM.init() without arguments](https://mikro-orm.io/docs/quick-start#running-mikroorminit-without-arguments).

#### NestJS integration

Please configure the `driver` property to `PGliteDriver`.

```typescript
import { Module } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { PGliteDriver } from "mikro-orm-pglite";

@Module({ imports: [MikroOrmModule.forRoot({ driver: PGliteDriver })] })
export class AppModule {}
```

> [!NOTE]
> For more information about MikroORM's NestJS integration, please read the [Using MikroORM with NestJS framework](https://mikro-orm.io/docs/usage-with-nestjs) document.

## Options

Additional configuration is possible via MikroORM's `driverOptions.pglite` property.

### `onCreateOptions`

Type: `Types.PGlite.OnCreateOptionsHandler`

```typescript
interface OnCreateOptionsHandler {
  (context: OnCreateOptionsContext): MaybePromise<void>;
}

interface OnCreateOptionsContext {
  config: Configuration;
  options: PGliteOptions;
  custom: Dictionary;
}
```

The `context` property of `onCreateOptions` is as follows:

`config` is a configuration object for the MikroORM instance.

`options` is a constructor parameter for the PGlite instance. The PGlite instance is initialized with values ​​that have changed since `onCreateOptions` was called.

`custom` is a user-defined object. The changed values ​​can be used in the `onClose` options. A use case is described in the `onClose` section.

One use case for `onCreateOptions` is to change the `debug` property to troubleshoot errors. Because PGlite is implemented using WASM, it's difficult to troubleshoot problems simply by looking at the call stack.

```typescript
const options = {
  debug: true,
  driverOptions: {
    pglite: {
      onCreateOptions: (context) => {
        if (context.config.get("debug")) {
          context.options.debug = 1;
        }
        // or
        if (process.env.DEBUG) {
          context.options.debug = 1;
        }
      },
    },
  },
};
```

> [!NOTE]
> For more information about the constructor parameters for initializing PGlite, please read the [PGlite Main Constructor](https://pglite.dev/docs/api#main-constructor) documentation.

### `onClose`

Type: `Types.PGlite.OnCloseHandler`

```typescript
interface OnCloseHandler {
  (context: OnCloseContext): MaybePromise<void>;
}

interface OnCloseContext {
  config: Configuration;
  options: PGliteOptions;
  instance: PGlite;
  custom: Dictionary;
}
```

The `context` property of `onClose` is as follows:

`config` is the configuration object for the MikroORM instance.

`options` is a constructor parameter for the PGlite instance. It contains the initialized values ​​for the PGlite instance.

`instance` is a PGlite instance.

`custom` is a user-defined object. You can use the modified values ​​in `onCreateOptions`.

One use case for `onClose` is saving and loading PGlite's memory data to and from the file system. PGlite can operate in either memory or file system mode, depending on its configuration. The example below demonstrates how to save data to the file system after operating in memory mode.

```typescript
const options = {
  driverOptions: {
    pglite: {
      onCreateOptions: (context) => {
        const dataPath = `./temp/backup-${crypto.randomUUID()}.tar.gz`;
        context.custom["dataPath"] = dataPath;

        if (await fs.promises.stat(dataPath).catch(() => null)) {
          const buffer = await fs.promises.readFile(dataPath);
          context.options.loadDataDir = new Blob([new Int8Array(buffer)]);
        }
      },
      onClose: (context) => {
        const dataPath = context.custom["dataPath"] as string;
        const blob = await context.instance.dumpDataDir("gzip");
        await fs.promises.writeFile(
          dataPath,
          Buffer.from(await blob.arrayBuffer())
        );
      },
    },
  },
};
```

### `instance`

Type: `Types.PGlite.InstanceProvider`

```typescript
interface InstanceProvider {
  (): MaybePromise<PGlite>;
}
```

`instance` is used when you need a PGlite instance that lasts longer than the lifetime of the MikroORM instance, or when you don't want to delegate the creation and termination of the PGlite instance to MikroORM. PGlite is particularly useful for testing because it can run in memory mode. If you have a large number of tests, you can reduce the startup time of each test by preloading the data and then `clone()`ing each test.

```typescript
const pglite = new PGlite();
// ... DB data settings
const options = {
  driverOptions: {
    pglite: {
      // Global instance reuse
      // instance: () => pglite,

      // Copying set data
      instance: () => pglite.clone(),
    },
  },
};
```

> [!NOTE]
> `instance` cannot be configured with `onCreateOptions` and `onClose`.

## License

MIT
