import type { Results } from "@electric-sql/pglite";
import { PGliteDialectDataSource } from "@harryplusplus/knex-pglite";
import { AbstractSqlConnection, type Knex, Utils } from "@mikro-orm/postgresql";
import { PGliteKnexDialect } from "./PGliteKnexDialect.js";

export class PGliteConnection extends AbstractSqlConnection {
  private readonly dialectDataSource = new PGliteDialectDataSource();

  override createKnex() {
    this.client = this.createKnexClient(PGliteKnexDialect as unknown as string);
    const dialect = this.getKnex().client as PGliteKnexDialect;
    dialect.ormConfig = this.config;
    dialect.driver = this.dialectDataSource;
    this.connected = true;
  }

  protected override getKnexOptions(type: string): Knex.Config {
    return Utils.mergeConfig(
      {
        client: type,
        pool: this.config.get("pool"),
        connection: {},
      },
      this.config.get("driverOptions")
    ) as Knex.Config;
  }

  override getClientUrl(): string {
    return "";
  }

  override getDefaultClientUrl(): string {
    return "";
  }

  protected override transformRawResult<T>(
    response: Results | Results[],
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

    return {
      affectedRows: response.affectedRows,
      insertId: (response.rows[0]?.["id"] as unknown) ?? 0,
      row: response.rows[0],
      rows: response.rows,
    } as T;
  }
}
