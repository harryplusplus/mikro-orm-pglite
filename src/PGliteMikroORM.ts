import {
  defineConfig,
  MikroORM,
  type EntityManager,
  type EntityManagerType,
  type IDatabaseDriver,
  type Options,
} from "@mikro-orm/core";
import { type SqlEntityManager } from "@mikro-orm/postgresql";
import { PGliteDriver } from "./PGliteDriver";

/**
 * @inheritDoc
 */
export class PGliteMikroORM<
  EM extends EntityManager = SqlEntityManager
> extends MikroORM<PGliteDriver, EM> {
  private static DRIVER = PGliteDriver;

  /**
   * @inheritDoc
   */
  static override async init<
    D extends IDatabaseDriver = PGliteDriver,
    EM extends EntityManager = D[typeof EntityManagerType] & EntityManager
  >(options?: Options<D, EM>): Promise<MikroORM<D, EM>> {
    return super.init(options);
  }

  /**
   * @inheritDoc
   */
  static override initSync<
    D extends IDatabaseDriver = PGliteDriver,
    EM extends EntityManager = D[typeof EntityManagerType] & EntityManager
  >(options: Options<D, EM>): MikroORM<D, EM> {
    return super.initSync(options);
  }
}

export type PGliteOptions = Options<PGliteDriver>;

/* istanbul ignore next */
export function definePGliteConfig(options: PGliteOptions) {
  return defineConfig({
    driver: PGliteDriver,
    // TODO: 실제 사용처 다시 검증해보기
    // TODO: knex-pglite -> PGlite 인자 어떻게 전달되는지 확인하기
    dbName: "postgres",
    ...options,
  });
}
