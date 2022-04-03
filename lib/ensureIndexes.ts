import type { Collection, Document, IndexDescription } from "mongodb";

const BENCHMARKS_ENABLED = process.env.BENCHMARKS_ENSUREINDEXES === "true";

// Ensures that the MongoDB collection has the desired indexes
// TODO: Figure out a more elegant solution (if this sadly isn't already the best solution)
export const ensureIndexes = async <TSchema extends Document = Document>(
  collection: Collection<TSchema>,
  dropOldIndexes: boolean,
  indexSpecs: IndexDescription[]
) => {
  // We can call createIndex on existing indexes since it _should_ just ignore it if the index already exists
  // However this means that any changes in the `indexSpecs` means that a new index will be created
  // ? Should I delete all indexes and recreate them?
  if (BENCHMARKS_ENABLED) console.time("ensureIndexes");
  if (dropOldIndexes) await collection.dropIndexes();
  await collection.createIndexes(indexSpecs);
  if (BENCHMARKS_ENABLED) console.timeEnd("ensureIndexes");
};
