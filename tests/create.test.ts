import { wrap } from "@mikro-orm/core";
import { MikroORM } from "../src";
import { expectAny, initOrm, User } from "./common";

let orm: MikroORM;
let em: MikroORM["em"];

beforeAll(async () => {
  orm = await initOrm();
  em = orm.em.fork();
});

afterAll(async () => {
  await orm?.close();
});

test("create using constructor", async () => {
  const user = new User();

  expect(user).toEqual({
    myDefault: expectAny(String),
    myOptional: null,
  });
  const wrapped = wrap(user, true);
  expect(wrapped.isInitialized()).toBe(true);
  expect(wrapped.hasPrimaryKey()).toBe(false);

  em.persist(user);

  expect(user).toEqual({
    myDefault: expectAny(String),
    myOptional: null,
  });
  expect(wrapped.isInitialized()).toBe(true);
  expect(wrapped.hasPrimaryKey()).toBe(false);

  await em.flush();

  expect(user).toEqual({
    id: expectAny(String),
    myDefault: expectAny(String),
    myOptional: null,
    createdAt: expectAny(Date),
  });
  expect(wrapped.isInitialized()).toBe(true);
  expect(wrapped.hasPrimaryKey()).toBe(true);
});

test("create using em.create", async () => {
  const user = em.create(User, {}, { partial: true });

  expect(user).toEqual({
    myDefault: expectAny(String),
    myOptional: null,
  });
  const wrapped = wrap(user, true);
  expect(wrapped.isInitialized()).toBe(true);
  expect(wrapped.hasPrimaryKey()).toBe(false);

  em.persist(user);

  expect(user).toEqual({
    myDefault: expectAny(String),
    myOptional: null,
  });
  expect(wrapped.isInitialized()).toBe(true);
  expect(wrapped.hasPrimaryKey()).toBe(false);

  await em.flush();

  expect(user).toEqual({
    id: expectAny(String),
    myDefault: expectAny(String),
    myOptional: null,
    createdAt: expectAny(Date),
  });
  expect(wrapped.isInitialized()).toBe(true);
  expect(wrapped.hasPrimaryKey()).toBe(true);
});
