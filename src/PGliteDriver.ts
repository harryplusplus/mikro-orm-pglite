import {
  AbstractSqlDriver,
  PostgreSqlPlatform,
  type Configuration,
} from "@mikro-orm/postgresql";
import { PGliteConnection } from "./PGliteConnection.js";

export class PGliteDriver extends AbstractSqlDriver<PGliteConnection> {
  constructor(config: Configuration) {
    super(config, new PostgreSqlPlatform(), PGliteConnection, [
      "knex",
      "@electric-sql/pglite",
      "@harryplusplus/knex-pglite",
    ]);
  }
}
