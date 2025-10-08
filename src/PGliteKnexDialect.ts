import type { PGliteInterface } from "@electric-sql/pglite";
import {
  _query,
  _stream,
  checkVersion,
  patchPGliteDialect,
  PGliteDialectDataSource,
  poolDefaults,
  processResponse,
  setSchemaSearchPath,
  type PoolDefaults,
  type QueryObject,
} from "@harryplusplus/knex-pglite";
import { PostgreSqlKnexDialect } from "@mikro-orm/postgresql";

export class PGliteKnexDialect extends PostgreSqlKnexDialect {
  declare driver?: unknown;
  declare connectionSettings?: unknown;
  declare searchPath?: unknown;
  declare _parseVersion?: (version: unknown) => unknown;
  declare logger?: { warn?: (message: unknown) => void };

  /**
   * After initializing driver to null, driver is injected by PGliteConnection
   * during createKnex step.
   */
  _driver(): null {
    return null;
  }

  getDataSource(): PGliteDialectDataSource {
    if (!this.driver) {
      throw new Error("The driver must be set in the createKnex step.");
    }

    return this.driver as PGliteDialectDataSource;
  }

  _acquireOnlyConnection(): Promise<PGliteInterface> {
    return this.getDataSource()._acquireOnlyConnection({
      getConnectionSettings: () => this.connectionSettings,
    });
  }

  destroyRawConnection(connection: PGliteInterface): Promise<void> {
    return this.getDataSource().destroyRawConnection(connection);
  }

  checkVersion(connection: PGliteInterface): Promise<string> {
    return checkVersion(
      {
        parseVersion: (version) => this._parseVersion?.(version),
      },
      connection
    );
  }

  setSchemaSearchPath(
    connection: PGliteInterface,
    searchPath: string | string[]
  ) {
    return setSchemaSearchPath(
      {
        getSearchPath: () => this.searchPath,
        warn: (message) => this.logger?.warn?.(message),
      },
      connection,
      searchPath
    );
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
