import "reflect-metadata";

import { describe, expect, it } from "vitest";
import {
  ArrayProperty,
  createJsonSchemaForClass,
  Property,
  Schema,
} from "../lib";

class Address {
  @Property()
  street: string;
  @Property()
  city: string;
  @Property()
  zip: string;
}

const addressJsonSchema = createJsonSchemaForClass(Address);

class Building {
  @Property()
  name: string;
  @Property({ jsonSchema: addressJsonSchema })
  address: Address;
}

const buildingJsonSchema = createJsonSchemaForClass(Building);

@Schema(
  {
    includeDefaultIdProperty: true,
  },
  {
    additionalProperties: false,
    required: [
      "id",
      "name",
      "currentBuilding",
      "mailingAddresses",
      "createdAt",
    ],
  }
)
class Employee {
  @Property()
  id: number;
  @Property()
  name: string;
  @Property({ jsonSchema: buildingJsonSchema })
  currentBuilding: Building;
  @ArrayProperty({ itemsJsonSchema: addressJsonSchema })
  mailingAddresses: Address[];
  @Property()
  createdAt: Date;
}

const employeeJsonSchema = createJsonSchemaForClass(Employee);

describe("Decorators", () => {
  it("Should create the JSON schemas", () => {
    expect(addressJsonSchema).toEqual({
      bsonType: "object",
      properties: {
        street: {
          bsonType: "string",
        },
        city: {
          bsonType: "string",
        },
        zip: {
          bsonType: "string",
        },
      },
    });
    expect(buildingJsonSchema).toEqual({
      bsonType: "object",
      properties: {
        name: {
          bsonType: "string",
        },
        address: addressJsonSchema,
      },
    });
    expect(employeeJsonSchema).toEqual({
      bsonType: "object",
      required: [
        "id",
        "name",
        "currentBuilding",
        "mailingAddresses",
        "createdAt",
      ],
      additionalProperties: false,
      properties: {
        _id: { bsonType: "objectId" },
        id: { bsonType: "number" },
        name: { bsonType: "string" },
        currentBuilding: buildingJsonSchema,
        mailingAddresses: {
          bsonType: "array",
          items: addressJsonSchema,
        },
        createdAt: { bsonType: "date" },
      },
    });
  });
});
