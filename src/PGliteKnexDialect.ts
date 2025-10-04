import { PGlite } from "@electric-sql/pglite";
import {
  PostgreSqlKnexDialect,
  Utils,
  type Constructor,
  type Knex,
} from "@mikro-orm/postgresql";
import { Readable, type Transform } from "stream";
import type { DriverOptionsWithPGlite, QueryObject } from "./types";

/**
 * The type references are the dependency libraries
 * @mikro-orm/postgresql@6.5.6 PostgreSqlKnexDialect
 * and kenx@3.1.0 knex/lib/dialects/postgresql Client_PG.
 */
interface KnexClientPG extends Knex.Client {
  searchPath: unknown;
  _acquireOnlyConnection(): unknown;
  _driver(): unknown;
  _parseVersion(versionString: unknown): unknown;
  _query(connection: unknown, obj: unknown): unknown;
  _stream(
    connection: unknown,
    obj: unknown,
    stream: unknown,
    options: unknown
  ): unknown;
  checkVersion(connection: unknown): unknown;
  processResponse(obj: unknown, runner: unknown): unknown;
  setSchemaSearchPath(connection: unknown, searchPath: unknown): unknown;
}

const TypedPostgreSqlKnexDialect = PostgreSqlKnexDialect as Constructor<
  PostgreSqlKnexDialect & KnexClientPG
>;

export class PGliteKnexDialect extends TypedPostgreSqlKnexDialect {
  constructor(config: Knex.Config) {
    super(config);
  }

  // Knex.Client overrides begin

  override destroyRawConnection(_connection: PGlite): Promise<void> {
    // noop
    return Promise.resolve();
  }

  override poolDefaults(): ReturnType<Knex.Client["poolDefaults"]> {
    return Utils.mergeConfig(super.poolDefaults(), {
      min: 1,
      max: 1,
    }) as ReturnType<Knex.Client["poolDefaults"]>;
  }

  // Knex.Client overrides end

  // Knex.Client_PG overrides begin

  override _acquireOnlyConnection(): Promise<PGlite> {
    return Promise.resolve(this.driver);
  }

  override _driver(): PGlite {
    return (this.config as Required<DriverOptionsWithPGlite>).pglite();
  }

  override async _query(
    connection: PGlite,
    obj: QueryObject
  ): Promise<QueryObject> {
    if (!obj.sql) {
      throw new Error("The query is empty");
    }

    console.log("obj.method", obj.method);

    if (obj.sql.split(";").filter((x) => x.trim().length !== 0).length > 1) {
      obj.response = await connection.exec(obj.sql);
    } else {
      obj.response = await connection.query(obj.sql, obj.bindings ?? []);
    }

    return obj;
  }

  override async _stream(
    connection: PGlite,
    obj: QueryObject,
    stream: Transform,
    _options: unknown
  ) {
    if (!obj.sql) {
      throw new Error("The query is empty");
    }

    // PGlite does not support query streaming. This implementation only
    // matches the interface for compatibility.
    const results = await connection.query(obj.sql, obj.bindings ?? []);
    const queryStream = Readable.from(results.rows);

    return new Promise((resolve, reject) => {
      queryStream.on("error", (e) => {
        stream.emit("error", e);
        reject(e);
      });
      stream.on("end", resolve);
      queryStream.pipe(stream);
    });
  }

  override async checkVersion(connection: PGlite): Promise<string> {
    const result = await connection.query("select version();");
    const row = result.rows[0] as { version?: string };
    return this._parseVersion(row.version) as string;
  }

  override processResponse(obj: QueryObject, runner: unknown) {
    if (!obj.response) {
      throw new Error("obj.response must exist.");
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

  override async setSchemaSearchPath(connection: PGlite, searchPath: unknown) {
    let path = searchPath || this.searchPath;
    if (!path) {
      return Promise.resolve(true);
    }

    if (!Array.isArray(path) && typeof path !== "string") {
      throw new TypeError(
        `knex: Expected searchPath to be Array/String, got: ${typeof path}`
      );
    }

    if (typeof path === "string") {
      if (path.includes(",")) {
        const parts = path.split(",");
        const arraySyntax = `[${parts
          .map((searchPath) => `'${searchPath}'`)
          .join(", ")}]`;
        this.ormConfig
          .getLogger()
          .warn(
            "PGlite",
            `Detected comma in searchPath "${path}".` +
              `If you are trying to specify multiple schemas, use Array syntax: ${arraySyntax}`
          );
      }
      path = [path];
    }

    path = (path as string[]).map((schemaName) => `"${schemaName}"`).join(",");

    await connection.exec(`set search_path to ${path as string}`);
    return true;
  }

  // Knex.Client_PG overrides end

  getPGlite(): PGlite {
    return this.driver as PGlite;
  }
}
