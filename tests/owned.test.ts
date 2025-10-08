import { wrap } from "@mikro-orm/core";
import { expect, test } from "vitest";
import { initOrm, User } from "./_common.js";

test("create", async () => {
  const orm = await initOrm();
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
  const orm = await initOrm();
  const em = orm.em.fork();
  const userRepository = em.getRepository(User);

  const users = await userRepository.findAll();
  expect(users).toEqual([]);

  await orm.close();
});
