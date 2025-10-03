import type {
  ConnectionConfig,
  Constructor,
  PoolConfig,
} from "@mikro-orm/core";
import type * as TypesDriver from "./types-driver";

export interface ConfigWithSqlConnection<T = unknown> {
  client: string | Constructor<T>;
  connection: ConnectionConfig;
  pool: PoolConfig;
}

export type Config = ConfigWithSqlConnection &
  TypesDriver.OptionsWithKnexConfig &
  TypesDriver.OptionsWithPGliteOptions;
