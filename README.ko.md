# MikroORM PGlite

[MikroORM](https://mikro-orm.io/)를 위한 [PGlite](https://pglite.dev/) 드라이버.

## 목차

<!-- toc -->

- [언어](#%EC%96%B8%EC%96%B4)
- [설치](#%EC%84%A4%EC%B9%98)
- [사용법](#%EC%82%AC%EC%9A%A9%EB%B2%95)
  - [초기화](#%EC%B4%88%EA%B8%B0%ED%99%94)
    - [MikroORM.init을 사용한 방법](#mikroorminit%EC%9D%84-%EC%82%AC%EC%9A%A9%ED%95%9C-%EB%B0%A9%EB%B2%95)
    - [NestJS 연동 방법](#nestjs-%EC%97%B0%EB%8F%99-%EB%B0%A9%EB%B2%95)
- [옵션](#%EC%98%B5%EC%85%98)
  - [`onCreateOptions`](#oncreateoptions)
  - [`onClose`](#onclose)
  - [`instance`](#instance)
- [라이선스](#%EB%9D%BC%EC%9D%B4%EC%84%A0%EC%8A%A4)

<!-- tocstop -->

## 언어

- [English](/README.md)
- [한국어](/README.ko.md)

## 설치

아래의 명령어를 사용해서 설치해주세요.

```sh
# npm 사용시
npm install @mikro-orm/core @mikro-orm/postgresql mikro-orm-pglite
# pnpm 사용시
pnpm add @mikro-orm/core @mikro-orm/postgresql mikro-orm-pglite
```

> [!WARNING]
> [Yarn](https://yarnpkg.com/)과 [Bun](https://bun.com/)은 아직 테스트하지 않았습니다.

## 사용법

### 초기화

#### MikroORM.init을 사용한 방법

아래 한 줄이면 PGlite를 사용한 MikroORM 준비가 완료됩니다.

```typescript
import { MikroORM } from "mikro-orm-pglite";

const orm = await MikroORM.init({ ... });
```

`mikro-orm-pglite` 패키지 내 `MikroORM` 클래스를 사용해서 초기화할 경우, `options` 매개변수의 `driver` 속성을 구성할 필요가 없습니다.

> [!NOTE]
> MikroORM 구성 방법에 대한 자세한 내용은 [Initializing the ORM](https://mikro-orm.io/docs/guide/first-entity#initializing-the-orm) 및 [Configuration](https://mikro-orm.io/docs/configuration) 문서를 읽어주세요.  
> 매개변수를 전달하지 않을 경우, 구성 파일이 필요합니다. 구성 파일에 대한 자세한 내용은 [Running MikroORM.init() without arguments](https://mikro-orm.io/docs/quick-start#running-mikroorminit-without-arguments) 문서를 읽어주세요.

#### NestJS 연동 방법

`driver` 속성을 `PGliteDriver`로 구성해주세요.

```typescript
import { Module } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { PGliteDriver } from "mikro-orm-pglite";

@Module({ imports: [MikroOrmModule.forRoot({ driver: PGliteDriver })] })
export class AppModule {}
```

> [!NOTE]
> MikroORM의 NestJS 연동에 대한 자세한 내용은 [Using MikroORM with NestJS framework](https://mikro-orm.io/docs/usage-with-nestjs) 문서를 읽어주세요.

## 옵션

MikroORM의 `driverOptions.pglite` 속성을 통해 추가적인 구성을 할 수 있습니다.

### `onCreateOptions`

타입: `Types.PGlite.OnCreateOptionsHandler`

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

`onCreateOptions`의 `context`의 속성은 다음과 같습니다.

`config`는 MikroORM 인스턴스의 설정 객체입니다.

`options`는 PGlite 인스턴스의 생성자 매개변수입니다. `onCreateOptions` 호출 이후 변경된 값을 사용해서 PGlite 인스턴스를 초기화합니다.

`custom`은 사용자 정의 객체입니다. 변경된 값은 `onClose` 옵션에서 사용할 수 있습니다. 사용 사례는 `onClose` 섹션에서 설명하겠습니다.

`onCreateOptions`의 사용사례 중 하나는 오류를 해결하기 위한 `debug` 속성 변경입니다. PGlite는 WASM을 사용한 구현이기 때문에, 문제 발생시 호출 스택만으로 문제를 해결하는 것은 쉽지 않기 때문입니다.

```typescript
const options = {
  debug: true,
  driverOptions: {
    pglite: {
      onCreateOptions: (context) => {
        if (context.config.get("debug")) {
          context.options.debug = 1;
        }
        // 또는
        if (process.env.DEBUG) {
          context.options.debug = 1;
        }
      },
    },
  },
};
```

> [!NOTE]
> PGlite를 초기화하기 위한 생성자 매개변수에 대한 자세한 내용은 [PGlite Main Constructor](https://pglite.dev/docs/api#main-constructor) 문서를 읽어주세요.

### `onClose`

타입: `Types.PGlite.OnCloseHandler`

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

`onClose`의 `context`의 속성은 다음과 같습니다.

`config`는 MikroORM 인스턴스의 설정 객체입니다.

`options`는 PGlite 인스턴스의 생성자 매개변수입니다. PGlite 인스턴스를 초기화한 값입니다.

`custom`은 사용자 정의 객체입니다. `onCreateOptions`에서 변경된 값을 사용할 수 있습니다.

`onClose`의 사용사례 중 하나는 PGlite의 메모리 데이터를 파일 시스템에 저장하고 로드하는 것입니다. PGlite는 설정에 따라 메모리, 파일 시스템 모드로 동작할 수 있습니다. 아래 예제는 메모리 모드로 동작한 이후에 파일 시스템에 저장하는 방법입니다.

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

타입: `Types.PGlite.InstanceProvider`

```typescript
interface InstanceProvider {
  (): MaybePromise<PGlite>;
}
```

`instance`는 MikroORM 인스턴스의 생명주기보다 긴 PGlite 인스턴스가 필요한 경우 또는 PGlite 인스턴스의 생성 및 종료 관리를 MikroORM에 위임하지 않는 경우에 사용합니다. PGlite는 메모리 모드로 동작할 수 있기 때문에 특히 테스트에 유용합니다. 테스트가 많은 경우, 미리 데이터를 로드한 후 각 테스트마다 `clone()`하면 각 테스트의 초기 시간을 줄일 수 있습니다.

```typescript
const pglite = new PGlite();
// ... DB 데이터 세팅
const options = {
  driverOptions: {
    pglite: {
      // 전역 인스턴스 재사용
      // instance: () => pglite,

      // 세팅된 데이터 복사
      instance: () => pglite.clone(),
    },
  },
};
```

> [!NOTE]
> `instance`는 `onCreateOptions` 및 `onClose`와 같이 구성할 수 없습니다.

## 라이선스

MIT
