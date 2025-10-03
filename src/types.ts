import type { Results } from "@electric-sql/pglite";
import type {
  Options as CoreOptions,
  Dictionary,
  EntityManager,
  EntityManagerType,
  IDatabaseDriver,
} from "@mikro-orm/core";
import type * as Driver from "./types-driver";
import type * as Knex from "./types-knex";
import type * as PGlite from "./types-pglite";
export { Driver, Knex, PGlite };

export type Options<
  D extends IDatabaseDriver = IDatabaseDriver,
  EM extends D[typeof EntityManagerType] &
    EntityManager = D[typeof EntityManagerType] & EntityManager,
> = CoreOptions<D, EM> & {
  driverOptions?: Driver.Options;
};

export interface QueryObject extends Dictionary {
  method?: string;
  sql?: string;
  bindings?: unknown[];
  response?: QueryResponse;
  output?: (response: QueryResponse) => unknown;
}

export type QueryResponse =
  | Results<Record<string, unknown>>
  | Results<Record<string, unknown>>[];

export interface PoolDefaults {
  min: number;
  max: number;
  propagateCreateError: boolean;
}
