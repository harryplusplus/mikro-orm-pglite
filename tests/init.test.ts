import { initOrm } from "./common";

test("init", async () => {
  const orm = await initOrm();
  await orm.close();
});
