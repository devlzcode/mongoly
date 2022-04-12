import { ObjectId } from "mongodb";
import type { JsonSchema, JsonSchemaArray, BsonType } from "./jsonSchemaTypes";
import type { ClassMetadata } from "./metadataStorage";
import { addPropertyMetadata, setClassMetadata } from "./metadataStorage";

const DATA_TYPE_TO_BSON_TYPE = new Map<Function, BsonType>([
  [Number, "number"],
  [Boolean, "bool"],
  [String, "string"],
  [Date, "date"],
  [ObjectId, "objectId"],
  [Buffer, "binData"],
]);

export const Schema = (classMetadata: ClassMetadata) => (target: unknown) => {
  if (!target || typeof target !== "function")
    throw new Error(`@Schema must be used on a class`);
  setClassMetadata(target, classMetadata);
};

export type PropertyOptions = {
  isNullable?: boolean;
  jsonSchema?: JsonSchema;
};

const inspectBsonType = (
  propertyOptions: PropertyOptions,
  jsonSchema: JsonSchema,
  target: unknown,
  propertyKey: string
) => {
  if (!target || typeof target !== "object")
    throw new Error(`@Property must be used in a class`);
  if (!jsonSchema.bsonType) {
    const dataType = Reflect.getMetadata("design:type", target, propertyKey);
    const bsonType = DATA_TYPE_TO_BSON_TYPE.get(dataType);
    if (!bsonType)
      throw new Error(`Unsupported data type at property "${propertyKey}"`);
    else jsonSchema.bsonType = bsonType;
  }
  if (propertyOptions.isNullable) {
    if (!(jsonSchema.bsonType instanceof Array))
      jsonSchema.bsonType = [jsonSchema.bsonType, "null"];
    else {
      if (!jsonSchema.bsonType.includes("null"))
        jsonSchema.bsonType.push("null");
    }
  }
};

export const Property =
  (propertyOptions: PropertyOptions = {}) =>
  (target: unknown, propertyKey: string) => {
    propertyOptions.jsonSchema = propertyOptions.jsonSchema || {};
    const jsonSchema = propertyOptions.jsonSchema;
    inspectBsonType(propertyOptions, jsonSchema, target, propertyKey);
    addPropertyMetadata((target as Object).constructor, {
      propertyKey,
      jsonSchema,
    });
  };

export type EnumPropertyOptions = {
  isNullable?: boolean;
  isArray?: boolean;
  values: unknown | unknown[];
};

export const EnumProperty =
  ({ values, isNullable, isArray }: EnumPropertyOptions) =>
  (target: unknown, propertyKey: string) => {
    if (!values || typeof values !== "object")
      throw new Error(`@EnumProperty values must be an object or an array`);
    if (!(values instanceof Array)) values = Object.values(values);
    const enumJsonSchema: JsonSchema = { enum: values as unknown[] };
    if (isNullable) enumJsonSchema.enum!.push(null);
    const jsonSchema: JsonSchema = isArray
      ? { bsonType: "array", items: enumJsonSchema }
      : enumJsonSchema;
    addPropertyMetadata((target as Object).constructor, {
      propertyKey,
      jsonSchema,
    });
  };

export type ArrayPropertyOptions = {
  itemsJsonSchema: JsonSchema;
  arrayJsonSchema?: Omit<JsonSchemaArray, "bsonType" | "array">;
};

export const ArrayProperty =
  ({ itemsJsonSchema, arrayJsonSchema = {} }: ArrayPropertyOptions) =>
  (target: unknown, propertyKey: string) => {
    if (!target || typeof target !== "object")
      throw new Error(`@ArrayProperty must be used in a class`);
    if (!itemsJsonSchema.bsonType)
      throw new Error(`"itemsJsonSchema" must have a "bsonType"`);
    const jsonSchema: JsonSchemaArray = {
      bsonType: "array",
      items: itemsJsonSchema,
      ...arrayJsonSchema,
    };
    addPropertyMetadata(target.constructor, {
      propertyKey,
      jsonSchema,
    });
  };
