# MikroORM PGlite

MikroORM용 PGlite 드라이버

## 목차

<!-- toc -->

- [언어](#%EC%96%B8%EC%96%B4)
- [설치](#%EC%84%A4%EC%B9%98)
- [사용법](#%EC%82%AC%EC%9A%A9%EB%B2%95)
  - [ORM 초기화](#orm-%EC%B4%88%EA%B8%B0%ED%99%94)
  - [설정 파일](#%EC%84%A4%EC%A0%95-%ED%8C%8C%EC%9D%BC)
  - [Nest.js 연동](#nestjs-%EC%97%B0%EB%8F%99)
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

## 라이선스

MIT
