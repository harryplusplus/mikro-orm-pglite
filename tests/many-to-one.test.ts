import { PGlite } from "@electric-sql/pglite";
import { ref, wrap } from "@mikro-orm/core";
import { afterAll, beforeAll, expect, test } from "vitest";
import { MikroORM, PGliteConnectionConfig } from "../src/index.js";
import { Book, initOrm, User } from "./common.js";

let orm: MikroORM;
let em: MikroORM["em"];
let pglite: PGlite;

beforeAll(async () => {
  pglite = await PGlite.create();
  orm = await initOrm({
    driverOptions: {
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

let bookId: string;
let userId: string;

test("create", async () => {
  const book = new Book();

  expect(book).toEqual({});
  expect(wrap(book).isInitialized()).toBe(true);
  expect(wrap(book, true).hasPrimaryKey()).toBe(false);

  em.persist(book);

  expect(book).toEqual({});
  expect(wrap(book).isInitialized()).toBe(true);
  expect(wrap(book, true).hasPrimaryKey()).toBe(false);

  const user = new User();
  em.persist(user);
  book.user = ref(user);
  await em.flush();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  expect(book).toMatchObject({ id: expect.any(String) });
  expect(book.user.unwrap()).toEqual({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    id: expect.any(String),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    myDefault: expect.any(String),
    myOptional: null,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    createdAt: expect.any(Date),
  });
  expect(wrap(book).isInitialized()).toBe(true);
  expect(wrap(book, true).hasPrimaryKey()).toBe(true);

  bookId = book.id;
  userId = book.user.id;
});

test("with identity map", async () => {
  const book = new Book();
  em.persist(book);

  book.user = em.getReference(User, userId, { wrapped: true });

  expect(wrap(book).isInitialized()).toBe(true);
  expect(wrap(book, true).hasPrimaryKey()).toBe(false);
  expect(book.user.isInitialized()).toBe(true);
  expect(wrap(book.user, true).hasPrimaryKey()).toBe(true);

  await em.flush();

  expect(wrap(book).isInitialized()).toBe(true);
  expect(wrap(book, true).hasPrimaryKey()).toBe(true);
  expect(book.user.isInitialized()).toBe(true);
  expect(wrap(book.user, true).hasPrimaryKey()).toBe(true);
});

test("without identity map", async () => {
  const em2 = em.fork();
  const book = new Book();
  em2.persist(book);

  book.user = em2.getReference(User, userId, { wrapped: true });

  expect(wrap(book).isInitialized()).toBe(true);
  expect(wrap(book, true).hasPrimaryKey()).toBe(false);
  expect(book.user.isInitialized()).toBe(false);
  expect(wrap(book.user, true).hasPrimaryKey()).toBe(true);

  await em2.flush();

  expect(wrap(book).isInitialized()).toBe(true);
  expect(wrap(book, true).hasPrimaryKey()).toBe(true);
  expect(book.user.isInitialized()).toBe(false);
  expect(wrap(book.user, true).hasPrimaryKey()).toBe(true);
});

test("populate", async () => {
  const book = await em.findOneOrFail(
    Book,
    { id: bookId, user: { id: userId } },
    { populate: ["user"] }
  );

  expect(wrap(book).isInitialized()).toBe(true);
  expect(wrap(book, true).hasPrimaryKey()).toBe(true);
  expect(book.user.isInitialized()).toBe(true);
  expect(wrap(book.user, true).hasPrimaryKey()).toBe(true);
});
