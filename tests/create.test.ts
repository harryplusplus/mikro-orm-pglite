import { wrap } from "@mikro-orm/core";
import { afterAll, beforeAll, expect, test } from "vitest";
import { MikroORM } from "../src/index.js";
import { initOrm, User } from "./common.js";

let orm: MikroORM;
let em: MikroORM["em"];

beforeAll(async () => {
  orm = await initOrm();
  em = orm.em.fork();
});

afterAll(async () => {
  await orm?.close();
});

test("create", async () => {
  const user = new User();
  expect(user).toEqual({
    myDefault: expect.any(String) as unknown,
    myOptional: null,
  });
  expect(wrap(user, true).isInitialized()).toBe(true);
  expect(wrap(user, true).hasPrimaryKey()).toBe(false);

  em.persist(user);

  expect(user).toEqual({
    myDefault: expect.any(String) as unknown,
    myOptional: null,
  });
  expect(wrap(user, true).isInitialized()).toBe(true);
  expect(wrap(user, true).hasPrimaryKey()).toBe(false);

  await em.flush();

  expect(user).toEqual({
    id: expect.any(String) as unknown,
    myDefault: expect.any(String) as unknown,
    myOptional: null,
    createdAt: expect.any(Date) as unknown,
  });
  expect(wrap(user, true).isInitialized()).toBe(true);
  expect(wrap(user, true).hasPrimaryKey()).toBe(true);
});
