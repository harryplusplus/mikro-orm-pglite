import {
  BigIntType,
  Entity,
  Index,
  ManyToOne,
  MikroORM,
  type Options,
  PrimaryKey,
  Property,
  type Ref,
} from "@mikro-orm/core";
import { PGliteDriver } from "../src/PGliteDriver.js";

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

export async function initOrm(options?: Options) {
  const orm = await MikroORM.init({
    driver: PGliteDriver,
    dbName: "my-db",
    entities: [User, Book],
    ...options,
  });
  await orm.schema.ensureDatabase();
  await orm.schema.updateSchema();
  return orm;
}
