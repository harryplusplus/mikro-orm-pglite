import { MikroORM } from "../src";
import { initOrm } from "./common";

let orm: MikroORM;

test("init", async () => {
  orm = await initOrm();
});

test("close", async () => {
  await orm.close();
});
