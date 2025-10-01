import { PGlite } from "@electric-sql/pglite";
import { type Dictionary, PostgreSqlKnexDialect } from "@mikro-orm/postgresql";
import defaults from "lodash.defaults";
import type { Constructor } from "type-fest";
import type { PGliteKnexDialectConfig, PGliteOptionsResolver } from "./types";
import type { __PostgreSqlKnexDialect } from "./unsafe-types";
import { VersionRow } from "./zod-schemas";

export const DEFAULT_PGLITE_OPTIONS_RESOLVER: PGliteOptionsResolver =
  () => ({});

// @ts-expect-error 타입 없는 의존성은 src/unsafe-types.d.ts에 정의함
const __PostgreSqlKnexDialect: Constructor<__PostgreSqlKnexDialect> =
  PostgreSqlKnexDialect;

export class PGliteKnexDialect extends __PostgreSqlKnexDialect {
  override config!: PGliteKnexDialectConfig;
  override driver!: PGlite;

  constructor(config: PGliteKnexDialectConfig) {
    super(config);
  }

  override _driver() {
    if (!this.config) {
      throw new Error("this.config must exist.");
    }

    const pgliteOptions = this.config.pgliteOptions
      ? this.config.pgliteOptions
      : DEFAULT_PGLITE_OPTIONS_RESOLVER;

    return new PGlite(pgliteOptions(this.config));
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
    const result = await connection.query("select version();");
    const row = result.rows[0];
    const { version } = VersionRow.parse(row);
    return this._parseVersion(version);
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
