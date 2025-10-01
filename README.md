# MikroORM PGlite

[PGlite](https://pglite.dev/) driver for [MikroORM](https://mikro-orm.io/).

## Table of Contents

<!-- toc -->

- [Languages](#languages)
- [Installation](#installation)
- [Usage](#usage)
  - [ORM Initialization](#orm-initialization)
  - [Configuration File](#configuration-file)
  - [Nest.js Integration](#nestjs-integration)
- [Options](#options)
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

## Usage

### ORM Initialization

```typescript
import { MikroORM } from "mikro-orm-pglite";

const orm = await MikroORM.init();
```

### Configuration File

```typescript
// mikro-orm.config.ts
import { defineConfig } from "mikro-orm-pglite";

export default defineConfig({});
```

### Nest.js Integration

```typescript
// app.module.ts
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { PGliteDriver } from "mikro-orm-pglite";

@Module({
  imports: [
    MikroOrmModule.forRoot({
      driver: PGliteDriver,
    }),
  ],
})
export class AppModule {}
```

## Options

Configure PGlite options via `driverOptions.pgliteOptions`.

```typescript
import { Options } from "mikro-orm-pglite";

// Add to MikroORM config wherever needed.
const options: Options = {
  driverOptions: {
    pgliteOptions: (config) => {
      // Receive combined MikroORM & Knex.js options,
      // return PGlite settings if needed.
      return {};
    };
  }
}
```

Use in `MikroORM.init`, `defineConfig`, or `MikroOrmModule.forRoot`.
Defaults are usually fine; override only if you need to tweak PGlite setup.

**See also:**

- [MikroORM Configuration](https://mikro-orm.io/docs/configuration)
- [PGlite Main Constructor](https://pglite.dev/docs/api#main-constructor)
- [Knex.js Configuration Options](https://knexjs.org/guide/#configuration-options)

## License

MIT
