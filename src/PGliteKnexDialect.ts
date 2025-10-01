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

// kenx@3.1.0 knex/lib/dialects/postgresql Client_PG
interface __Client_PG extends Knex.Client {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _driver(): any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _acquireOnlyConnection(): any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  checkVersion(connection: any): any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _parseVersion(versionString: any): any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _query(connection: any, obj: any): any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  processResponse(obj: any, runner: any): any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  destroyRawConnection(connection: any): any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  poolDefaults(): any;
}

// @mikro-orm/postgresql@6.5.6 PostgreSqlKnexDialect
// @ts-expect-error type mismatch
// Knex.Client queryCompiler() tableCompiler()
// PostgreSqlKnexDialect queryCompiler() tableCompiler()
interface __PostgreSqlKnexDialect extends __Client_PG, PostgreSqlKnexDialect {}

// @ts-expect-error The actual implementation interface related to this type
// error is the same as the upper library version.
const __PostgreSqlKnexDialect: Constructor<__PostgreSqlKnexDialect> =
  PostgreSqlKnexDialect;

export interface PartialPgResult {
  command?: string;
  rowCount?: number | null;
}

export interface Response extends Results, PartialPgResult {}

export interface QueryObject extends Dictionary {
  method?: string;
  sql?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bindings?: any[];
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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.driver;
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

  override destroyRawConnection(_connection: PGlite) {
    // noop
  }

  override poolDefaults() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return defaults({ min: 1, max: 1 }, super.poolDefaults());
  }

  override async checkVersion(connection: PGlite): Promise<string> {
    const result = await connection.query("select version();");
    const row = result.rows[0] as { version?: string };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this._parseVersion(row.version);
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override processResponse(obj: QueryObject, runner: any) {
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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return super.processResponse(obj, runner);
  }
}
