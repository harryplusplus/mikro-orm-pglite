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

## License

MIT
