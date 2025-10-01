import type { Knex, PostgreSqlKnexDialect } from "@mikro-orm/postgresql";

// kenx@3.1.0 knex/lib/dialects/postgresql Client_PG
interface __Client_PG extends Knex.Client {
  _driver(): any;
  _acquireOnlyConnection(): Promise<any>;
  checkVersion(connection: any): Promise<any>;
  _parseVersion(versionString: any): any;
}

// @mikro-orm/postgresql@6.5.6 PostgreSqlKnexDialect
interface __PostgreSqlKnexDialect extends __Client_PG, PostgreSqlKnexDialect {}
