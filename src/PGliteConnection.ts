import { Results } from "@electric-sql/pglite";
import { AbstractSqlConnection, Knex, Utils } from "@mikro-orm/postgresql";
import { PGliteKnexDialect } from "./PGliteKnexDialect.js";

export class PGliteConnection extends AbstractSqlConnection {
  override createKnex() {
    this.client = this.createKnexClient(PGliteKnexDialect as unknown as string);
    (this.getKnex().client as PGliteKnexDialect).ormConfig = this.config;
    this.connected = true;
  }

  protected override getKnexOptions(type: string): Knex.Config {
    return Utils.mergeConfig(
      {
        client: type,
        pool: this.config.get("pool"),
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

    const row0 = response.rows[0];
    return {
      affectedRows: response.affectedRows,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      insertId: row0?.["id"] ?? 0,
      row: response.rows[0],
      rows: response.rows,
    } as T;
  }
}
