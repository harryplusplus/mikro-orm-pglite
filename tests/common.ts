import {
  BigIntType,
  Entity,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
  type Ref,
} from "@mikro-orm/core";
import { MikroORM } from "../src/index.js";
import { PGliteOptions } from "../src/PGliteMikroORM.js";

@Entity({ tableName: "users" })
@Index({ properties: ["myDefault", "myOptional"] })
export class User {
  @PrimaryKey({ type: new BigIntType("string") })
  id!: string;

  @Property({ type: "uuid", unique: true })
  myDefault: string = crypto.randomUUID();

  @Property({ type: "text", unique: true })
  myOptional: string | null = null;

  @Property({ type: "timestamptz", defaultRaw: "current_timestamp" })
  createdAt!: Date;
}

@Entity({ tableName: "books" })
export class Book {
  @PrimaryKey({ type: new BigIntType("string") })
  id!: string;

  @ManyToOne({ entity: () => User, ref: true })
  user!: Ref<User>;
}

export async function initOrm(options?: PGliteOptions) {
  const orm = await MikroORM.init({
    dbName: "my-db",
    entities: [User, Book],
    ...options,
  });
  await orm.schema.refreshDatabase();
  return orm;
}
