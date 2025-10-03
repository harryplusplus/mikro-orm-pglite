import type { PGlite } from "@electric-sql/pglite";
import {
  PostgreSqlKnexDialect,
  Utils,
  type Constructor,
  type Knex,
} from "@mikro-orm/postgresql";
import { PGliteKnexDriver } from "./PGliteKnexDriver";
import type { PoolDefaults, QueryObject } from "./types";
import type * as TypesKnex from "./types-knex";

/**
 * The type references are the dependency libraries
 * @mikro-orm/postgresql@6.5.6 PostgreSqlKnexDialect
 * and kenx@3.1.0 knex/lib/dialects/postgresql Client_PG.
 */
interface KnexClientPG extends Knex.Client {
  _driver(): unknown;
  _acquireOnlyConnection(): unknown;
  checkVersion(connection: unknown): unknown;
  _parseVersion(versionString: unknown): unknown;
  _query(connection: unknown, obj: unknown): unknown;
  processResponse(obj: unknown, runner: unknown): unknown;
}

const TypedPostgreSqlKnexDialect = PostgreSqlKnexDialect as Constructor<
  PostgreSqlKnexDialect & KnexClientPG
>;

export class PGliteKnexDialect extends TypedPostgreSqlKnexDialect {
  constructor(config: TypesKnex.Config) {
    super(config);
  }

  override _driver(): PGliteKnexDriver {
    return new PGliteKnexDriver(this);
  }

  override _acquireOnlyConnection(): Promise<PGlite> {
    const connection = this.getKnexDriver().acquire();
    return Promise.resolve(connection);
  }

  override destroyRawConnection(connection: PGlite): Promise<void> {
    return Promise.resolve(this.getKnexDriver().release(connection));
  }

  override poolDefaults(): PoolDefaults {
    return Utils.mergeConfig(super.poolDefaults(), {
      min: 1,
      max: 1,
    }) as PoolDefaults;
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

    const { response } = obj;
    (Array.isArray(response) ? response : [response]).forEach((x) => {
      x.affectedRows ??= 0;
    });

    if (obj.output) {
      return obj.output.call(runner, response);
    }

    if (obj.method === "raw") return response;

    throw new Error(`Unexpected method. method: ${obj.method}`);
  }

  getKnexDriver(): PGliteKnexDriver {
    if (!(this.driver instanceof PGliteKnexDriver)) {
      throw new Error("driver is not initialized.");
    }

    return this.driver;
  }
}
