import { type Knex } from "@mikro-orm/postgresql";
import ClientPGLite from "knex-pglite";

export class PGliteKnexDialect extends ClientPGLite {
  constructor(config: Knex.Config) {
    // NOTE
    // MikroORM 초기화시 pool이 비어있는 객체로 초기화된 후, knex-pglite Client 구현에서 pool 객체 유무를 검증함.
    // PGlite는 pool을 사용할 수 없으므로 사용자 pool 설정이 없는 것이 납득은 할 수 있음.
    // 하지만 이것은 트릭키한 대응임.
    if (config.pool) {
      delete config.pool;
    }

    super(config);
  }
}
