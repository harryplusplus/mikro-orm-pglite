import { MikroORM } from "@mikro-orm/core";
import { PGliteDriver } from "mikro-orm-pglite";

const orm = await MikroORM.init({
  driver: PGliteDriver,
  dbName: "postgres",
});

await orm.close();
