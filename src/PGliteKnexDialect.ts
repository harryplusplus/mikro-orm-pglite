import { PGlite, Results } from "@electric-sql/pglite";
import { type Dictionary, PostgreSqlKnexDialect } from "@mikro-orm/postgresql";
import defaults from "lodash.defaults";
import type { Constructor } from "type-fest";
import type { PGliteKnexDialectConfig, PGliteOptionsResolver } from "./types";
import type { __PostgreSqlKnexDialect } from "./unsafe-types";

export const DEFAULT_PGLITE_OPTIONS_RESOLVER: PGliteOptionsResolver =
  () => ({});

// @ts-expect-error 타입 없는 의존성은 src/unsafe-types.d.ts에 정의함
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
