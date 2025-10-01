import {
  BigIntType,
  Entity,
  ManyToOne,
  PrimaryKey,
  type Ref,
} from "@mikro-orm/postgresql";
import { MikroORM } from "../src";

@Entity({ tableName: "users" })
export class User {
  @PrimaryKey({ type: new BigIntType("string") })
  id!: string;
}

@Entity({ tableName: "books" })
export class Book {
  @PrimaryKey({ type: new BigIntType("string") })
  id!: string;

  @ManyToOne({ entity: () => User, ref: true })
  user!: Ref<User>;
}

export async function initOrm() {
  const orm = await MikroORM.init({
    dbName: "test-db",
    entities: [User, Book],
    debug: true,
  });
  await orm.schema.refreshDatabase();
  return orm;
}
