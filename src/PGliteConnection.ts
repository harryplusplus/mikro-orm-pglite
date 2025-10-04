import { PGlite } from "@electric-sql/pglite";
import {
  AbstractSqlConnection,
  type Configuration,
  type ConnectionOptions,
  type Knex,
  Utils,
} from "@mikro-orm/postgresql";
import { PGliteKnexDialect } from "./PGliteKnexDialect";
import type { DriverOptionsWithPGlite, QueryResponse } from "./types";

export class PGliteConnection extends AbstractSqlConnection {
  private readonly pglite: PGlite;

  constructor(
    config: Configuration,
    options?: ConnectionOptions,
    type?: "read" | "write"
  ) {
    super(config, options, type);

    const { pglite = () => new PGlite() } = this.config.get<
      "driverOptions",
      DriverOptionsWithPGlite
    >("driverOptions");
    this.pglite = pglite();
  }

  override async connect(): Promise<void> {
    await this.pglite.waitReady;
    this.createKnex();
  }

  override createKnex() {
    this.client = this.createKnexClient(PGliteKnexDialect as unknown as string);
    (this.getKnex().client as PGliteKnexDialect).ormConfig = this.config;
    this.connected = true;
  }

  protected override getKnexOptions(type: string): Knex.Config {
    return Utils.mergeConfig(
      {
        client: type,
        connection: {
          dbName: this.config.get("dbName"),
          user: this.config.get("user"),
          schema: this.config.get("schema"),
        },
        pool: this.config.get("pool"),
      },
      this.config.get("driverOptions"),
      {
        pglite: () => this.pglite,
      }
    ) as Knex.Config;
  }

  override getClientUrl(): string {
    return "";
  }

  override getDefaultClientUrl(): string {
    return "";
  }

  protected override transformRawResult<T>(
    response: QueryResponse,
    method: "all" | "get" | "run"
  ): T {
    if (Array.isArray(response)) {
      return response.map((row) => this.transformRawResult(row, method)) as T;
    }

    if (method === "get") {
      return response.rows[0] as T;
    }

    if (method === "all") {
      return response.rows as T;
    }

    const row0 = response.rows[0];
    return {
      affectedRows: response.affectedRows,
      insertId: row0 ? row0["id"] : 0,
      row: response.rows[0],
      rows: response.rows,
    } as T;
  }

  getPGlite(): PGlite {
    return this.pglite;
  }
}
