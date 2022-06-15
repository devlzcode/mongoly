import { Collection, Db, MongoClient } from "mongodb";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { ensureIndexes, ensureJsonSchema } from "../lib/index";
import { UpdateBuilder } from "../lib/tools";
import {
  ArrayProperty,
  createJsonSchemaForClass,
  Property,
  Schema,
} from "../lib/decorators";

class Friend {
  @Property()
  name: string;
  @Property()
  age?: number;

  constructor(name: string, age?: number) {
    this.name = name;
    if (age) this.age = age;
  }
}

const friendJsonSchema = createJsonSchemaForClass(Friend);

@Schema({
  includeDefaultIdProperty: true,
  additionalProperties: false,
  required: ["name", "age", "friends"],
})
class User {
  @Property()
  name: string;
  @Property()
  age: number;
  @ArrayProperty({ itemsJsonSchema: friendJsonSchema })
  friends: Friend[];
  @Property({ jsonSchema: friendJsonSchema })
  bestFriend: Friend;

  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }
}

const userSchema = createJsonSchemaForClass(User);

@Schema({
  mergeWith: userSchema,
})
class UserWithDate {
  @Property()
  createdAt: Date;
}

const userWithDateSchema = createJsonSchemaForClass(UserWithDate);

describe("MongoDB", () => {
  let client: MongoClient;
  let db: Db;
  let collection: Collection<User>;
  beforeAll(async () => {
    client = await MongoClient.connect("mongodb://localhost:27017");
    db = client.db("test");
    collection = db.collection("users");
    await collection.deleteMany({});
  });
  it("Should create/update a collection with the JSON schema", async () => {
    await ensureJsonSchema(db, "users", userSchema);
    const options = await collection.options();
    expect(options.validator).toEqual({ $jsonSchema: userSchema });
  });
  it("Should modify the collection with the JSON schema", async () => {
    await ensureJsonSchema(db, "users", userWithDateSchema);
    const options = await collection.options();
    expect(options.validator).toEqual({ $jsonSchema: userWithDateSchema });
  });
  it("Should ensure the desired indexes exists with dropping old indexes", async () => {
    await ensureIndexes(collection, true, [
      {
        key: { name: "text" },
      },
    ]);
    const indexes = await collection.indexes();
    expect(indexes).toEqual([
      { v: 2, key: { _id: 1 }, name: "_id_" },
      {
        v: 2,
        key: { _fts: "text", _ftsx: 1 },
        name: "name_text",
        weights: { name: 1 },
        default_language: "english",
        language_override: "language",
        textIndexVersion: 3,
      },
    ]);
  });
  it("Should ensure the desired indexes exists without dropping any old indexes", async () => {
    await ensureIndexes(collection, false, [
      {
        key: { "bestFriend.age": 1 },
      },
    ]);
    const indexes = await collection.indexes();
    expect(indexes).toEqual([
      { v: 2, key: { _id: 1 }, name: "_id_" },
      {
        v: 2,
        key: { _fts: "text", _ftsx: 1 },
        name: "name_text",
        weights: { name: 1 },
        default_language: "english",
        language_override: "language",
        textIndexVersion: 3,
      },
      { v: 2, key: { "bestFriend.age": 1 }, name: "bestFriend.age_1" },
    ]);
  });
  it("Should insert a valid document into the collection", async () => {
    const user = new User("John", 24);
    user.friends = [new Friend("Jack"), new Friend("Jill")];
    user.bestFriend = new Friend("Jane", 22);
    await collection.insertOne(user);
  });
  it("Should update a valid document in the collection", async () => {
    const builder = new UpdateBuilder();
    builder.$set({ "friends.$[].age": 21 });
    builder.$inc({ "bestFriend.age": 1 });
    const result = await collection.findOneAndUpdate(
      { "bestFriend.age": 22 },
      builder.build(),
      { returnDocument: "after" }
    );
    expect(result.ok).toBe(1);
    expect(result.value!.bestFriend.age).toBe(23);
  });
  afterAll(async () => {
    //await collection.drop();
    await client.close();
  });
});
