import {
  defineConfig,
  MikroORM,
  type EntityManager,
  type EntityManagerType,
  type IDatabaseDriver,
} from "@mikro-orm/core";
import { type SqlEntityManager } from "@mikro-orm/postgresql";
import type { Types } from ".";
import { PGliteDriver } from "./PGliteDriver";

/**
 * @inheritDoc
 */
export class PGliteMikroORM<
  EM extends EntityManager = SqlEntityManager,
> extends MikroORM<PGliteDriver, EM> {
  private static DRIVER = PGliteDriver;

  /**
   * @inheritDoc
   */
  static override async init<
    D extends IDatabaseDriver = PGliteDriver,
    EM extends EntityManager = D[typeof EntityManagerType] & EntityManager,
  >(options?: Types.Options<D, EM>): Promise<MikroORM<D, EM>> {
    return super.init(options);
  }

  /**
   * @inheritDoc
   */
  static override initSync<
    D extends IDatabaseDriver = PGliteDriver,
    EM extends EntityManager = D[typeof EntityManagerType] & EntityManager,
  >(options: Types.Options<D, EM>): MikroORM<D, EM> {
    return super.initSync(options);
  }
}

export type PGliteOptions = Types.Options<PGliteDriver>;

/* istanbul ignore next */
export function definePGliteConfig(options: PGliteOptions) {
  return defineConfig({ driver: PGliteDriver, ...options });
}
