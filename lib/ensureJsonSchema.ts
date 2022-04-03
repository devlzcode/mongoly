import { isDeepStrictEqual } from "node:util";
import type { Db } from "mongodb";
import type { ObjectKeywords } from "./jsonSchemaTypes";

const BENCHMARKS_ENABLED = process.env.BENCHMARKS_ENSUREJSONSCHEMA === "true";

// Ensures that the MongoDB collection has a JSON schema set to validate insertions and updates
// TODO: Figure out a more elegant solution (if this sadly isn't already the best solution)
export const ensureJsonSchema = async (
  db: Db,
  collectionName: string,
  jsonSchema: ObjectKeywords
) => {
  if (BENCHMARKS_ENABLED) console.time("ensureJsonSchema");
  const validator = { $jsonSchema: jsonSchema };
  const collections = await db
    .listCollections({ name: collectionName })
    .toArray();
  if (collections.length === 0) {
    console.debug(`Creating collection "${collectionName}" in ${db.namespace}`);
    await db.createCollection(collectionName, { validator });
  } else {
    const collection = db.collection(collectionName);
    const options = await collection.options();
    if (!isDeepStrictEqual(options.validator, validator)) {
      console.debug(`Updating validator for ${collection.namespace}`);
      await db.command({ collMod: collectionName, validator });
    }
  }
  if (BENCHMARKS_ENABLED) console.timeEnd("ensureJsonSchema");
};
