import type { PGlite, Results } from "@electric-sql/pglite";
import type {
  Options as CoreOptions,
  EntityManager,
  EntityManagerType,
  IDatabaseDriver,
} from "@mikro-orm/core";
import type { Knex } from "@mikro-orm/postgresql";

export interface QueryObject {
  method?: string;
  sql?: string;
  bindings?: unknown[];
  response?: QueryResponse;
  output?: (response: QueryResponse) => unknown;
}

export type QueryResponse =
  | Results<Record<string, unknown>>
  | Results<Record<string, unknown>>[];

export interface PGliteProvider {
  (): PGlite;
}

export interface DriverOptionsWithPGlite {
  pglite?: PGliteProvider;
}

export type DriverOptions = (Knex.Config & DriverOptionsWithPGlite) | Knex;

export type Options<
  D extends IDatabaseDriver = IDatabaseDriver,
  EM extends D[typeof EntityManagerType] &
    EntityManager = D[typeof EntityManagerType] & EntityManager,
> = CoreOptions<D, EM> & {
  driverOptions?: DriverOptions;
};
