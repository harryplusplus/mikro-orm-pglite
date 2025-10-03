import { AbstractSqlConnection } from "@mikro-orm/postgresql";
import type { Types } from ".";
import { PGliteKnexDialect } from "./PGliteKnexDialect";

export class PGliteConnection extends AbstractSqlConnection {
  override async connect(): Promise<void> {
    await super.connect();
    await this.getKnexClient().getKnexDriver().connect();
    this.connected = true;
  }

  override async close(force?: boolean): Promise<void> {
    await this.getKnexClient().getKnexDriver().close();
    await super.close(force);
  }

  override createKnex() {
    this.client = this.createKnexClient(PGliteKnexDialect as unknown as string);
    this.getKnexClient().ormConfig = this.config;
  }

  override getDefaultClientUrl() {
    return "mikro-orm-pglite://";
  }

  protected override transformRawResult<T>(
    response: Types.QueryResponse,
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

  private getKnexClient(): PGliteKnexDialect {
    const knexClient = this.getKnex().client as unknown;
    if (!(knexClient instanceof PGliteKnexDialect)) {
      throw new Error("Knex client is not initialized.");
    }

    return knexClient;
  }
}
