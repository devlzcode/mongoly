import { JsonSchema, JsonSchemaObject } from "./jsonSchemaTypes";

export type ClassOptions = {
  includeDefaultIdProperty?: boolean;
  mergeWith?: JsonSchemaObject | JsonSchemaObject[];
  omitProperties?: string[];
  pickProperties?: string[];
  renameProperties?: { [oldName: string]: string };
};

export type JsonSchemaClass = Omit<JsonSchemaObject, "bsonType" | "properties">;

export type ClassMetadata = ClassOptions & JsonSchemaClass;

type PropertyMetadata = {
  propertyKey: string;
  jsonSchema: JsonSchema;
};

const classMetadata = new Map<Function, ClassMetadata>();
const propertyMetadata = new Map<Function, PropertyMetadata[]>();

export const setClassMetadata = (target: Function, metadata: ClassMetadata) =>
  classMetadata.set(target, metadata);

export const getClassMetadata = (target: Function) => classMetadata.get(target);

export const addPropertyMetadata = (
  target: Function,
  metadata: PropertyMetadata
) => {
  const properties = propertyMetadata.get(target) || [];
  properties.push(metadata);
  propertyMetadata.set(target, properties);
};

export const getClassPropertyMetadata = (target: Function) =>
  propertyMetadata.get(target);
