import { PGlite } from "@electric-sql/pglite";
import { test } from "vitest";
import { MikroORM, PGliteConnectionConfig } from "../src/index.js";
import { initOrm } from "./common.js";

let orm: MikroORM;
let pglite: PGlite;

test("init", async () => {
  pglite = await PGlite.create();
  orm = await initOrm({
    driverOptions: {
      connection: {
        pglite: () => pglite,
      } satisfies PGliteConnectionConfig,
    },
  });
});

test("close", async () => {
  await orm.close();
  await pglite.close();
});
