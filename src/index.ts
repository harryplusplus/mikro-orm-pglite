import { defineConfig, type Options } from "@mikro-orm/core";
import {
  AbstractSqlDriver,
  PostgreSqlConnection,
  PostgreSqlPlatform,
  type Configuration,
  type Knex,
} from "@mikro-orm/postgresql";
import ClientPGlite from "knex-pglite";

class PGliteKnexDialect extends ClientPGlite {
  constructor(config: Knex.Config) {
    // MikroORM 초기화시 pool이 비어있는 객체로 초기화된 후, knex-pglite Client 구현에서 pool 객체 유무를 검증함.
    // PGlite는 pool을 사용할 수 없으므로 사용자 pool 설정이 없는 것이 납득은 할 수 있음.
    // 하지만 이것은 트릭키한 대응임.
    if (config.pool) {
      delete config.pool;
    }

    super(config);
  }
}

export class PGliteConnection extends PostgreSqlConnection {
  override createKnex() {
    this.client = this.createKnexClient(PGliteKnexDialect as unknown as string);
    this.connected = true;
  }

  override getDefaultClientUrl() {
    return "pglite://default.url:1";
  }
}

export class PGliteDriver extends AbstractSqlDriver<PGliteConnection> {
  constructor(config: Configuration) {
    super(config, new PostgreSqlPlatform(), PGliteConnection, ["knex"]);
  }
}

export type PGliteOptions = Options<PGliteDriver>;

export function definePGliteConfig(options?: PGliteOptions) {
  return defineConfig({
    driver: PGliteDriver,
    dbName: "postgres",
    ...options,
  });
}
