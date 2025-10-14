# MikroORM PGlite Driver

[![test](https://github.com/harryplusplus/mikro-orm-pglite/actions/workflows/test.yml/badge.svg)](https://github.com/harryplusplus/mikro-orm-pglite/actions/workflows/test.yml)
[![npm version](https://img.shields.io/npm/v/mikro-orm-pglite)](https://www.npmjs.com/package/mikro-orm-pglite)
[![npm downloads](https://img.shields.io/npm/dm/mikro-orm-pglite)](https://www.npmjs.com/package/mikro-orm-pglite)

[PGlite](https://pglite.dev/)를 [MikroORM](https://mikro-orm.io/)과 함께 사용하기 위한 드라이버입니다.

## 목차

<!-- toc -->

- [언어](#%EC%96%B8%EC%96%B4)
- [설치](#%EC%84%A4%EC%B9%98)
- [사용법](#%EC%82%AC%EC%9A%A9%EB%B2%95)
  - [쉬운 초기화](#%EC%89%AC%EC%9A%B4-%EC%B4%88%EA%B8%B0%ED%99%94)
  - [PGlite 인스턴스 주입](#pglite-%EC%9D%B8%EC%8A%A4%ED%84%B4%EC%8A%A4-%EC%A3%BC%EC%9E%85)
- [API](#api)
  - [`connection`](#connection)
    - [`pglite`](#pglite)
- [라이선스](#%EB%9D%BC%EC%9D%B4%EC%84%A0%EC%8A%A4)

<!-- tocstop -->

## 언어

- [English](/README.md)
- [한국어](/README.ko.md)

## 설치

아래 명령어로 설치합니다.

```sh
# npm 사용시
npm install @mikro-orm/core @mikro-orm/postgresql @electric-sql/pglite mikro-orm-pglite
# pnpm 사용시
pnpm add @mikro-orm/core @mikro-orm/postgresql @electric-sql/pglite mikro-orm-pglite
```

> [!WARNING]  
> [Yarn](https://yarnpkg.com/)과 [Bun](https://bun.com/) 환경에서는 아직 테스트되지 않았습니다.

## 사용법

### 쉬운 초기화

`mikro-orm-pglite` 패키지 내 `MikroORM`, `defineConfig` 또는 `PGliteDriver`를 사용해 구성할 수 있습니다.

> [!WARNING]  
> `dbName` 속성은 반드시 구성해야 합니다.

아래 예제는 `MikroORM.init`을 사용한 방법입니다.

```typescript
import { MikroORM } from "mikro-orm-pglite";

const orm = await MikroORM.init({
  dbName: "postgres",
  // ...
});
```

아래 예제는 `defineConfig`를 사용한 방법입니다.

```typescript
import { MikroORM } from "mikro-orm-pglite";

const orm = await MikroORM.init();
```

```typescript
// src/mikro-orm.config.ts
import { defineConfig } from "mikro-orm-pglite";

export default defineConfig({
  dbName: "postgres",
});
```

아래 예제는 `PGliteDriver`를 사용한 방법입니다.

```typescript
import { MikroORM } from "@mikro-orm/core";
import { PGliteDriver } from "mikro-orm-pglite";

const orm = MikroORM.init({
  driver: PGliteDriver,
  dbName: "postgres",
});
```

> [!NOTE]  
> MikroORM 구성 방법에 대한 자세한 내용은 아래 문서를 읽어주세요.
>
> - [Initializing the ORM](https://mikro-orm.io/docs/guide/first-entity#initializing-the-orm)
> - [Configuration](https://mikro-orm.io/docs/configuration)
> - [Running MikroORM.init() without arguments](https://mikro-orm.io/docs/quick-start#running-mikroorminit-without-arguments)
> - [Using MikroORM with NestJS framework](https://mikro-orm.io/docs/usage-with-nestjs)

### PGlite 인스턴스 주입

[쉬운 초기화](#%EC%89%AC%EC%9A%B4-%EC%B4%88%EA%B8%B0%ED%99%94) 방법을 사용할 경우, PGlite 인스턴스는 In-memory 임시 저장소 방식으로 초기화됩니다.
또한 PGlite 인스턴스는 MikroORM 인스턴스가 소유한(**owned**) 상태가 됩니다.
다시 말해 PGlite 인스턴스는 MikroORM 인스턴스와 생명주기를 공유합니다.

In-memory 임시 저장소 방식의 PGlite 인스턴스의 경우, 사용 사례에 따라 MikroORM 인스턴스와 생명주기를 공유하는 것이 요구사항에 부합하지 않을 수 있습니다.
또한 파일 시스템 저장소 방식으로 초기화하거나 PGlite 생성자의 다양한 매개변수를 활용하고 싶을 수 있습니다.

`driverOptions.connection.pglite` 속성을 PGlite 인스턴스를 반환하는 동기 또는 비동기 함수로 구성합니다.
이 경우 MikroORM 내부에서는 PGlite 인스턴스를 빌린(**borrowed**) 상태로 간주합니다.
다시 말해 MikroORM은 PGlite 인스턴스의 생명주기를 외부로 위임했기 때문에, PGlite 인스턴스의 생성과 소멸을 관리하지 않습니다.

아래 예제는 PGlite 인스턴스를 주입하는 방법입니다.

```typescript
import { PGlite } from "@electric-sql/pglite";
import { MikroORM, PGliteConnectionConfig } from "mikro-orm-pglite";

const pglite = new PGlite();

const orm = await MikroORM.init({
  dbName: "postgres",
  driverOptions: {
    connection: {
      pglite: () => pglite,
    } satisfies PGliteConnectionConfig,
  },
  // ...
});

// ...

await pglite.close();
```

## API

`driverOptions` 속성의 매개변수 중에서 다음 속성을 구성합니다.

### `connection`

`connection` 속성의 타입은 다음과 같습니다.

```typescript
export interface PGliteConnectionConfig {
  pglite?: PGliteProvider;
}
```

다음은 `connection`을 구성하기 위한 속성입니다.

#### `pglite`

`pglite` 속성의 타입은 다음과 같습니다.

```typescript
export interface PGliteProvider {
  (): MaybePromise<PGlite>; // (): PGlite | Promise<PGlite>
}
```

> [!NOTE]  
> PGlite의 다양한 기능을 확인하려면 [PGlite API](https://pglite.dev/docs/api) 문서를 읽어주세요.

## 라이선스

MIT
