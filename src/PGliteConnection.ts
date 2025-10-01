import { PostgreSqlConnection } from "@mikro-orm/postgresql";
import { PGliteKnexDialect } from "./PGliteKnexDialect";

export class PGliteConnection extends PostgreSqlConnection {
  override createKnex() {
    this.client = this.createKnexClient(PGliteKnexDialect as unknown as string);
    (this.client.client as PGliteKnexDialect).ormConfig = this.config;
    this.connected = true;
  }

  override getDefaultClientUrl() {
    return "mikro-orm-pglite://";
  }
}
