import { PGlite } from "@electric-sql/pglite";
import {
  type Configuration,
  type Dictionary,
  type Knex,
  PostgreSqlKnexDialect,
} from "@mikro-orm/postgresql";
import defaults from "lodash.defaults";
import type { PGliteOptionsFactory } from "./types";

export const DEFAULT_PGLITE_OPTIONS_FACTORY: PGliteOptionsFactory = () => ({});

declare class _TypedPostgreSqlKnexDialect {
  config: Knex.Config;
  driver: PGlite;
  ormConfig: Configuration;
  logger: Knex.Logger;
  constructor(config: Knex.Config);
  _driver(): PGlite;
  _acquireOnlyConnection(): Promise<PGlite>;
  poolDefaults(): Dictionary;
  checkVersion(connection: PGlite): Promise<string>;
  _query(connection: PGlite, obj: Dictionary): Promise<Dictionary>;
  _parseVersion(version: string): string;
  processResponse(obj: Dictionary, runner: Dictionary): Dictionary;
}

// @ts-expect-error Knex.Client_PG
const typedPostgreSqlKnexDialect: typeof _TypedPostgreSqlKnexDialect =
  PostgreSqlKnexDialect;

export class PGliteKnexDialect extends typedPostgreSqlKnexDialect {
  constructor(config: Knex.Config) {
    super(config);
  }

  override _driver() {
    if (!this.config) {
      throw new Error("this.config must exist.");
    }

    const pgliteOptionsFactory =
      "pgliteOptions" in this.config &&
      typeof this.config.pgliteOptions === "function"
        ? (this.config.pgliteOptions as PGliteOptionsFactory)
        : DEFAULT_PGLITE_OPTIONS_FACTORY;
    return new PGlite(pgliteOptionsFactory(this.config));
  }

  override async _acquireOnlyConnection() {
    if (!this.driver) {
      throw new Error("this.driver must exist.");
    }

    await this.driver.waitReady;
    return this.driver;
  }

  override poolDefaults() {
    return defaults({ min: 1, max: 1 }, super.poolDefaults());
  }

  override async checkVersion(connection: PGlite) {
    const res = await connection.query("select version();");
    return this._parseVersion((res.rows[0] as { version: string }).version);
  }

  override async _query(connection: PGlite, obj: Dictionary) {
    // TODO: log to context
    // {"method":"raw","sql":"drop table if exists \"books\" cascade;\ndrop table if exists \"users\" cascade;","bindings":[],"options":{},"__knexQueryUid":"WrzmahUhvTCqEbhBKlxp0"}
    this.ormConfig.getLogger().log("pglite", `_query: ${JSON.stringify(obj)}`);
    obj.response = await connection.query(obj.sql, obj.bindings);
    return obj;
  }

  override processResponse(obj: Dictionary, runner: Dictionary): Dictionary {
    obj.response.rowCount = obj.response.affectedRows;
    return super.processResponse(obj, runner);
  }
}
