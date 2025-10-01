import { ref, wrap } from "@mikro-orm/core";
import { MikroORM } from "../src";
import { Book, expectAny, initOrm, User } from "./common";

let orm: MikroORM;
let em: MikroORM["em"];

beforeAll(async () => {
  orm = await initOrm();
  em = orm.em.fork();
});

afterAll(async () => {
  await orm?.close();
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

  expect(book).toMatchObject({ id: expectAny(String) });
  expect(book.user.unwrap()).toEqual({
    id: expectAny(String),
    myDefault: expectAny(String),
    myOptional: null,
    createdAt: expectAny(Date),
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
