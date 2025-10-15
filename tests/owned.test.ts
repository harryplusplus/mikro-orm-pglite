import { MikroORM, wrap } from "@mikro-orm/core";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { initOrm, User } from "./_common.js";

describe("shared orm", () => {
  let orm: MikroORM;

  beforeAll(async () => {
    orm = await initOrm();
  });

  afterAll(async () => {
    await orm.close();
  });

  test("create", async () => {
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
    expect(wrap(user).isInitialized()).toBe(true);
    expect(wrap(user, true).hasPrimaryKey()).toBe(true);
  });

  test("findAll", async () => {
    const em = orm.em.fork();
    const userRepository = em.getRepository(User);

    const users = await userRepository.findAll();
    expect(users).toEqual([
      {
        createdAt: expect.any(Date) as unknown,
        id: expect.any(String) as unknown,
        myDefault: expect.any(String) as unknown,
        myOptional: null,
      },
    ]);
  });
});

test("isolated orm", async () => {
  const orm = await initOrm();
  const em = orm.em.fork();
  const userRepository = em.getRepository(User);

  const users = await userRepository.findAll();
  expect(users).toEqual([]);

  await orm.close();
});
