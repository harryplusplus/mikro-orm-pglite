# MikroORM PGlite

[MikroORM](https://mikro-orm.io/)를 위한 [PGlite](https://pglite.dev/) 드라이버.

## 목차

<!-- toc -->

- [언어](#%EC%96%B8%EC%96%B4)
- [설치](#%EC%84%A4%EC%B9%98)
- [사용법](#%EC%82%AC%EC%9A%A9%EB%B2%95)
  - [ORM 초기화](#orm-%EC%B4%88%EA%B8%B0%ED%99%94)
  - [설정 파일](#%EC%84%A4%EC%A0%95-%ED%8C%8C%EC%9D%BC)
  - [Nest.js 연동](#nestjs-%EC%97%B0%EB%8F%99)
- [옵션](#%EC%98%B5%EC%85%98)
- [라이선스](#%EB%9D%BC%EC%9D%B4%EC%84%A0%EC%8A%A4)

<!-- tocstop -->

## 언어

- [English](/README.md)
- [한국어](/README.ko.md)

## 설치

npm 또는 pnpm 사용:

```sh
# npm
npm install @mikro-orm/core @mikro-orm/postgresql mikro-orm-pglite
# pnpm
pnpm add @mikro-orm/core @mikro-orm/postgresql mikro-orm-pglite
```

## 사용법

### ORM 초기화

```typescript
import { MikroORM } from "mikro-orm-pglite";

const orm = await MikroORM.init();
```

### 설정 파일

```typescript
// mikro-orm.config.ts
import { defineConfig } from "mikro-orm-pglite";

export default defineConfig({});
```

### Nest.js 연동

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

## 옵션

`driverOptions.pgliteOptions`를 통해 PGlite 옵션을 구성할 수 있습니다.

```typescript
import { Options } from "mikro-orm-pglite";

// MikroORM 설정 어디서든 추가해서 사용하면 됩니다.
const options: Options = {
  driverOptions: {
    pgliteOptions: (config) => {
      // MikroORM과 Knex.js 옵션이 합쳐져서 넘어옵니다.
      // 필요하면 여기서 PGlite 세팅값을 반환하세요.
      return {};
    };
  }
}
```

`MikroORM.init`, `defineConfig`, `MikroOrmModule.forRoot` 어디서든 사용 가능합니다.
별도 설정이 필요 없다면 기본값으로도 충분합니다. PGlite 설정을 변경할 때만 오버라이드하세요.

**참고:**

- [MikroORM Configuration](https://mikro-orm.io/docs/configuration)
- [PGlite Main Constructor](https://pglite.dev/docs/api#main-constructor)
- [Knex.js Configuration Options](https://knexjs.org/guide/#configuration-options)

## 라이선스

MIT
