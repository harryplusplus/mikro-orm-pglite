import type { PGliteInterface } from "@electric-sql/pglite";
import {
  _query,
  _stream,
  patchPGliteDialect,
  PGliteDialectContext,
  poolDefaults,
  processResponse,
  type PoolDefaults,
  type QueryObject,
} from "@harryplusplus/knex-pglite";
import { PostgreSqlKnexDialect } from "@mikro-orm/postgresql";

export class PGliteKnexDialect extends PostgreSqlKnexDialect {
  _driver(): PGliteDialectContext {
    return new PGliteDialectContext({
      getConnectionSettings: () => {
        if (!("connectionSettings" in this)) {
          throw new Error("this.connectionSettings must exist.");
        }

        if (typeof this["connectionSettings"] !== "object") {
          throw new Error("this.connectionSettings must be object type.");
        }

        return this["connectionSettings"] as object;
      },
      getSearchPath: () => {
        if (
          !("searchPath" in this) ||
          typeof this["searchPath"] !== "string" ||
          Array.isArray(this["searchPath"])
        ) {
          return null;
        }

        return this["searchPath"];
      },
      parseVersion: (version) => {
        if (
          !("_parseVersion" in this) ||
          typeof this["_parseVersion"] !== "function"
        ) {
          throw new Error("this._parseVersion must exist.");
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
        const parsedVersion = this["_parseVersion"](version);
        if (typeof parsedVersion !== "string") {
          throw new Error("The version must be string type.");
        }

        return parsedVersion;
      },
      log: (level, message) => {
        if (level === "warn") {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          this["logger"]?.["warn"]?.(message);
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          this["logger"]?.["debug"]?.(message);
        }
      },
    });
  }

  getContext(): PGliteDialectContext {
    return this["driver"] as PGliteDialectContext;
  }

  _acquireOnlyConnection(): Promise<PGliteInterface> {
    return this.getContext()._acquireOnlyConnection();
  }

  destroyRawConnection(connection: PGliteInterface): Promise<void> {
    return this.getContext().destroyRawConnection(connection);
  }

  checkVersion(connection: PGliteInterface): Promise<string> {
    return this.getContext().checkVersion(connection);
  }

  setSchemaSearchPath(
    connection: PGliteInterface,
    searchPath: string | string[]
  ) {
    return this.getContext().setSchemaSearchPath(connection, searchPath);
  }

  _stream(
    connection: PGliteInterface,
    obj: QueryObject,
    stream: NodeJS.WritableStream,
    options: unknown
  ) {
    return _stream(connection, obj, stream, options);
  }

  _query(connection: PGliteInterface, obj: QueryObject): Promise<QueryObject> {
    return _query(connection, obj);
  }

  processResponse(obj: QueryObject, runner: unknown): unknown {
    return processResponse(obj, runner);
  }

  poolDefaults(): PoolDefaults {
    return poolDefaults();
  }
}

patchPGliteDialect(PGliteKnexDialect);
