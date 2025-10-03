import type { Knex } from "@mikro-orm/postgresql";
import type * as TypesPGlite from "./types-pglite";

export type OptionsWithKnexConfig = Knex.Config;

export interface OptionsWithPGliteOptions {
  pglite?: TypesPGlite.Options;
}

export type OptionsWithKnex = Knex;

export type Options =
  | (OptionsWithKnexConfig & OptionsWithPGliteOptions)
  | OptionsWithKnex;
