export type BsonType =
  | "double"
  | "string"
  | "object"
  | "array"
  | "binData"
  | "objectId"
  | "bool"
  | "boolean"
  | "date"
  | "null"
  | "regex"
  | "javascript"
  | "number"
  | "int"
  | "timestamp"
  | "long"
  | "decimal";

export type NumberKeywords = {
  bsonType?: "double" | "int" | "long" | "decimal";
  multipleOf?: number;
  maximum?: number;
  exlcusiveMaximum?: number;
  minmum?: number;
  exclusiveMinimum?: number;
};

export type StringKeywords = {
  bsonType: "string";
  maxLength?: number;
  minLength?: number;
  pattern?: string;
};

export type ObjectKeywords = {
  bsonType: "object";
  maxProperties?: number;
  minProperties?: number;
  required?: string[];
  additionalProperties?: boolean | JsonSchema;
  properties?: Record<string, JsonSchema>;
  patternProperties?: Record<string, JsonSchema>;
};

export type ArrayKeywords = {
  bsonType: "array";
  additionalItems?: boolean | JsonSchema;
  items?: JsonSchema | JsonSchema[];
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
};

export type GenericKeywords = {
  bsonType?: BsonType | BsonType[];
  description?: string;
  enum?: unknown[];
  allOf?: JsonSchema[];
  anyOf?: JsonSchema[];
  oneOf?: JsonSchema[];
  not?: JsonSchema;
};

export type JsonSchemaNumber = GenericKeywords & NumberKeywords;
export type JsonSchemaString = GenericKeywords & StringKeywords;
export type JsonSchemaObject = GenericKeywords & ObjectKeywords;
export type JsonSchemaArray = GenericKeywords & ArrayKeywords;

export type JsonSchema =
  | GenericKeywords
  | JsonSchemaNumber
  | JsonSchemaString
  | JsonSchemaObject
  | JsonSchemaArray;
