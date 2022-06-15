import { describe, expect, it } from "vitest";
import { createJsonSchemaForClass, Property, Schema } from "../lib/decorators";

@Schema({ additionalProperties: false })
class Asset {
  @Property()
  readonly assetId: number;
  @Property()
  readonly name: string;
  @Property()
  readonly value: number;
}

const AssetJsonSchema = createJsonSchemaForClass(Asset);

@Schema({ additionalProperties: false })
class UserAsset {
  @Property()
  userAssetId: number;
  @Property()
  userId: number;
  @Property({ isNullable: true })
  serialNumber?: number;
  @Property({ jsonSchema: AssetJsonSchema })
  asset: Asset;
}

const UserAssetJsonSchema = createJsonSchemaForClass(UserAsset);

@Schema({
  mergeWith: UserAssetJsonSchema,
  omitProperties: ["asset", "userId"],
  renameProperties: {
    userAssetId: "id",
    userId: "ownerId",
    serialNumber: "serial",
  },
})
class SkinnyUserAsset {
  id: number;
  serial?: number;
}

const SkinnyUserAssetSchema = createJsonSchemaForClass(SkinnyUserAsset);

describe("More Decorator Tests", () => {
  it("Should create the JSON schemas", () => {
    expect(UserAssetJsonSchema).toEqual({
      bsonType: "object",
      additionalProperties: false,
      properties: {
        userAssetId: {
          bsonType: "number",
        },
        userId: {
          bsonType: "number",
        },
        serialNumber: {
          bsonType: ["null", "number"],
        },
        asset: {
          bsonType: "object",
          additionalProperties: false,
          properties: {
            assetId: {
              bsonType: "number",
            },
            name: {
              bsonType: "string",
            },
            value: {
              bsonType: "number",
            },
          },
        },
      },
    });
    expect(SkinnyUserAsset).toEqual({
      bsonType: "object",
      additionalProperties: false,
      properties: {
        id: {
          bsonType: "number",
        },
        ownerId: {
          bsonType: "number",
        },
        serial: {
          bsonType: ["null", "number"],
        },
      },
    });
  });
});
