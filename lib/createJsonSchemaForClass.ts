import type { GenericKeywords, ObjectKeywords } from "./jsonSchemaTypes";
import { getClassMetadata, getClassPropertyMetadata } from "./metadataStorage";

const BENCHMARKS_ENABLED =
  process.env.BENCHMARKS_CREATEJSONSCHEMAFORCLASS === "true";

const DEFAULT_ID_PROPERTY: GenericKeywords = { bsonType: "objectId" };

const jsonSchemaStorage = new Map<Function, ObjectKeywords>();

const createProperties = (target: Function) => {
  const propertyMetadata = getClassPropertyMetadata(target);
  if (!propertyMetadata)
    throw new Error(
      `Target class "${target}" does not have any property metadata`
    );
  const properties: ObjectKeywords["properties"] = {};
  for (const { propertyKey, jsonSchema } of propertyMetadata)
    properties[propertyKey] = jsonSchema;
  return properties;
};

export const getExistingJsonSchemaForClass = (target: Function) =>
  jsonSchemaStorage.get(target);

// Should merge `properties`, `required`, `additionalProperties` and `patternProperties`
const mergeJsonSchema = (target: ObjectKeywords, source: ObjectKeywords) => {
  if (source.required) {
    if (target.required) {
      const unique = source.required.filter((x) =>
        target.required!.includes(x)
      );
      target.required.push(...unique);
    } else target.required = source.required;
  }
  if (source.properties)
    target.properties = { ...source.properties, ...target.properties };
  if (source.patternProperties) {
    if (!target.patternProperties)
      target.patternProperties = source.patternProperties;
    else
      target.patternProperties = {
        ...target.patternProperties,
        ...source.patternProperties,
      };
  }
  if (
    source.additionalProperties !== true &&
    target.additionalProperties !== false
  ) {
    // Should only merge if `source.additionalProperties` is not `true` and `target.additionalProperties` is not `false`
    if (!target.additionalProperties || target.additionalProperties === true) {
      target.additionalProperties = source.additionalProperties;
    } else
      target.additionalProperties = {
        ...source.additionalProperties,
        ...target.additionalProperties,
      };
  }
};

export const createJsonSchemaForClass = (target: Function) => {
  if (BENCHMARKS_ENABLED) console.time(`createJsonSchemaForClass`);
  const existingJsonSchema = getExistingJsonSchemaForClass(target);
  if (existingJsonSchema) return existingJsonSchema;
  const classMetadata = getClassMetadata(target) || {};
  const jsonSchema: ObjectKeywords = {
    bsonType: "object",
  };
  if (classMetadata.required) jsonSchema.required = classMetadata.required;
  if (
    classMetadata.additionalProperties !== undefined &&
    classMetadata.additionalProperties !== null
  )
    jsonSchema.additionalProperties = classMetadata.additionalProperties;
  let properties = createProperties(target);
  if (classMetadata.includeDefaultIdProperty)
    properties = { _id: DEFAULT_ID_PROPERTY, ...properties };
  jsonSchema.properties = properties;
  if (classMetadata.mergeWith) {
    if (classMetadata.mergeWith instanceof Array) {
      for (const mergeWith of classMetadata.mergeWith)
        mergeJsonSchema(jsonSchema, mergeWith);
    } else mergeJsonSchema(jsonSchema, classMetadata.mergeWith);
  }
  jsonSchemaStorage.set(target, jsonSchema);
  if (BENCHMARKS_ENABLED) console.timeEnd(`createJsonSchemaForClass`);
  return jsonSchema;
};
