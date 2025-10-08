import { PGlite } from "@electric-sql/pglite";
import { wrap } from "@mikro-orm/core";
import { afterAll, beforeAll, expect, test } from "vitest";
import { PGliteConnectionConfig } from "../src/index.js";
import { initOrm, User } from "./_common.js";

let pglite: PGlite;

beforeAll(async () => {
  pglite = await PGlite.create();
});

afterAll(async () => {
  await pglite.close();
});

test("create", async () => {
  const orm = await initOrm({
    driverOptions: {
      connection: {
        pglite: () => pglite,
      } satisfies PGliteConnectionConfig,
    },
  });
  const em = orm.em.fork();
  const userRepository = em.getRepository(User);

  const user = userRepository.create({}, { partial: true });
  await em.flush();

  expect(user).toEqual({
    id: expect.any(String) as unknown,
    myDefault: expect.any(String) as unknown,
    myOptional: null,
    createdAt: expect.any(Date) as unknown,
  });
  expect(wrap(user, true).isInitialized()).toBe(true);
  expect(wrap(user, true).hasPrimaryKey()).toBe(true);

  await orm.close();
});

test("findAll", async () => {
  const orm = await initOrm({
    driverOptions: {
      connection: {
        pglite: () => pglite,
      } satisfies PGliteConnectionConfig,
    },
  });
  const em = orm.em.fork();
  const userRepository = em.getRepository(User);

  const users = await userRepository.findAll();
  expect(users).toEqual([
    {
      createdAt: expect.any(Date) as string,
      id: expect.any(String) as unknown,
      myDefault: expect.any(String) as unknown,
      myOptional: null,
    },
  ]);

  await orm.close();
});
