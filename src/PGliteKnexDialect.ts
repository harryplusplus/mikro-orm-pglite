import { PGlite, type Results } from "@electric-sql/pglite";
import {
  type Dictionary,
  type Knex,
  PostgreSqlKnexDialect,
} from "@mikro-orm/postgresql";
import defaults from "lodash.defaults";
import type { Constructor } from "type-fest";
import type { PGliteKnexDialectConfig, PGliteOptionsResolver } from "./types";

export const DEFAULT_PGLITE_OPTIONS_RESOLVER: PGliteOptionsResolver =
  () => ({});

/**
 * The type references are the dependency libraries
 * @mikro-orm/postgresql@6.5.6 PostgreSqlKnexDialect
 * and kenx@3.1.0 knex/lib/dialects/postgresql Client_PG.
 */
interface __Client_PG extends Knex.Client {
  _driver(): unknown;
  _acquireOnlyConnection(): unknown;
  checkVersion(connection: unknown): unknown;
  _parseVersion(versionString: unknown): unknown;
  _query(connection: unknown, obj: unknown): unknown;
  processResponse(obj: unknown, runner: unknown): unknown;
  tableCompiler(): unknown;
  queryCompiler(): unknown;
}

// @ts-expect-error The instance's interface is defined by the version of the
// dependency @mikro-orm/postgresql (@mikro-orm/knex, knex).
const __PostgreSqlKnexDialect: Constructor<
  PostgreSqlKnexDialect & __Client_PG
> = PostgreSqlKnexDialect;

export interface PartialPgResult {
  command?: string;
  rowCount?: number | null;
}

export interface Response extends Results, PartialPgResult {}

export interface QueryObject extends Dictionary {
  method?: string;
  sql?: string;
  bindings?: unknown[];
  response?: Response | Response[];
}

export class PGliteKnexDialect extends __PostgreSqlKnexDialect {
  constructor(config: PGliteKnexDialectConfig) {
    super(config);
  }

  getConfig(): PGliteKnexDialectConfig {
    if (!this.config) {
      throw new Error("config is not initialized.");
    }

    return this.config;
  }

  getDriver(): PGlite {
    if (!this.driver) {
      throw new Error("driver is not initialized.");
    }

    return this.driver as PGlite;
  }

  override _driver() {
    const config = this.getConfig();
    const pgliteOptions = config.pgliteOptions
      ? config.pgliteOptions
      : DEFAULT_PGLITE_OPTIONS_RESOLVER;

    return new PGlite(pgliteOptions(config));
  }

  override async _acquireOnlyConnection() {
    const driver = this.getDriver();
    await driver.waitReady;
    return driver;
  }

  override async destroyRawConnection(_connection: PGlite): Promise<void> {
    // noop
    await Promise.resolve();
  }

  override poolDefaults() {
    return defaults({ min: 1, max: 1 }, super.poolDefaults());
  }

  override async checkVersion(connection: PGlite): Promise<string> {
    const result = await connection.query("select version();");
    const row = result.rows[0] as { version?: string };
    return this._parseVersion(row.version) as string;
  }

  override async _query(
    connection: PGlite,
    obj: QueryObject
  ): Promise<QueryObject> {
    if (!obj.sql) {
      throw new Error("obj.sql must exists.");
    }

    if (obj.sql.split(";").filter((x) => x.trim().length !== 0).length > 1) {
      obj.response = await connection.exec(obj.sql);
    } else {
      obj.response = await connection.query(obj.sql, obj.bindings ?? []);
    }

    return obj;
  }

  override processResponse(obj: QueryObject, runner: unknown) {
    if (!obj.response) {
      throw new Error("obj.response must exists.");
    }

    const responses = Array.isArray(obj.response)
      ? obj.response
      : [obj.response];
    responses.forEach((x) => {
      x.rowCount = x.affectedRows ?? null;
      x.command = obj.method?.toUpperCase() ?? "";
    });

    return super.processResponse(obj, runner);
  }
}
