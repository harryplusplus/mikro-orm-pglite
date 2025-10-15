import { PGlite } from "@electric-sql/pglite";
import { MikroORM } from "@mikro-orm/core";
import { PGliteConnectionConfig, PGliteDriver } from "mikro-orm-pglite";

const pglite = new PGlite();

const orm = await MikroORM.init({
  driver: PGliteDriver,
  dbName: "postgres",
  driverOptions: {
    connection: {
      pglite: () => pglite,
    } satisfies PGliteConnectionConfig,
  },
});

await orm.close();

await pglite.close();
