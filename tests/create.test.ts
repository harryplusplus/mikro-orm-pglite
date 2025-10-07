import { PGlite } from "@electric-sql/pglite";
import { wrap } from "@mikro-orm/core";
import { afterAll, beforeAll, expect, test } from "vitest";
import { MikroORM, PGliteConnectionConfig } from "../src/index.js";
import { initOrm, User } from "./common.js";

let pglite: PGlite;
let orm: MikroORM;
let em: MikroORM["em"];

beforeAll(async () => {
  pglite = await PGlite.create();
  orm = await initOrm({
    driverOptions: {
      debug: true,
      connection: {
        pglite: () => pglite,
      } satisfies PGliteConnectionConfig,
    },
  });
  em = orm.em.fork();
});

afterAll(async () => {
  await orm?.close();
  await pglite?.close();
});

test("create using constructor", async () => {
  const user = new User();

  expect(user).toEqual({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    myDefault: expect.any(String),
    myOptional: null,
  });
  const wrapped = wrap(user, true);
  expect(wrapped.isInitialized()).toBe(true);
  expect(wrapped.hasPrimaryKey()).toBe(false);

  em.persist(user);

  expect(user).toEqual({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    myDefault: expect.any(String),
    myOptional: null,
  });
  expect(wrapped.isInitialized()).toBe(true);
  expect(wrapped.hasPrimaryKey()).toBe(false);

  await em.flush();

  expect(user).toEqual({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    id: expect.any(String),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    myDefault: expect.any(String),
    myOptional: null,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    createdAt: expect.any(Date),
  });
  expect(wrapped.isInitialized()).toBe(true);
  expect(wrapped.hasPrimaryKey()).toBe(true);
});

test("create using em.create", async () => {
  const user = em.create(User, {}, { partial: true });

  expect(user).toEqual({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    myDefault: expect.any(String),
    myOptional: null,
  });
  const wrapped = wrap(user, true);
  expect(wrapped.isInitialized()).toBe(true);
  expect(wrapped.hasPrimaryKey()).toBe(false);

  em.persist(user);

  expect(user).toEqual({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    myDefault: expect.any(String),
    myOptional: null,
  });
  expect(wrapped.isInitialized()).toBe(true);
  expect(wrapped.hasPrimaryKey()).toBe(false);

  await em.flush();

  expect(user).toEqual({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    id: expect.any(String),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    myDefault: expect.any(String),
    myOptional: null,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    createdAt: expect.any(Date),
  });
  expect(wrapped.isInitialized()).toBe(true);
  expect(wrapped.hasPrimaryKey()).toBe(true);
});
