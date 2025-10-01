import type { PGliteOptions } from "@electric-sql/pglite";
import type {
  Options as CoreOptions,
  Dictionary,
  EntityManager,
  EntityManagerType,
  IDatabaseDriver,
} from "@mikro-orm/core";
import type { Knex } from "@mikro-orm/postgresql";

export type PGliteKnexDialectConfig = Knex.Config & DriverOptions;

export type PGliteOptionsResolver = (
  config: PGliteKnexDialectConfig
) => PGliteOptions;

export type DriverOptions =
  | Dictionary & {
      pgliteOptions?: PGliteOptionsResolver;
    };

export type Options<
  D extends IDatabaseDriver = IDatabaseDriver,
  EM extends D[typeof EntityManagerType] &
    EntityManager = D[typeof EntityManagerType] & EntityManager
> = CoreOptions<D, EM> & {
  driverOptions?: DriverOptions;
};
