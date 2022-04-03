import type {
  IntegerType,
  MatchKeysAndValues,
  NumericType,
  OnlyFieldsOfType,
  PullAllOperator,
  PullOperator,
  PushOperator,
  SetFields,
  Timestamp,
  UpdateFilter,
} from "mongodb";

export type BitFields<TSchema> = OnlyFieldsOfType<
  TSchema,
  NumericType | undefined,
  { and: IntegerType } | { or: IntegerType } | { xor: IntegerType }
>;

export type CurrentDateFields<TSchema> = OnlyFieldsOfType<
  TSchema,
  Date | Timestamp,
  true | { $type: "date" | "timestamp" }
>;

export type NumericFields<TSchema> = OnlyFieldsOfType<
  TSchema,
  NumericType | undefined
>;

export type PopFields<TSchema> = OnlyFieldsOfType<
  TSchema,
  ReadonlyArray<any>,
  1 | -1
>;

export type UnsetFields<TSchema> = OnlyFieldsOfType<
  TSchema,
  any,
  "" | true | 1
>;

export type RenameFields = Record<string, string>;

export type UpdateOperator =
  | "$addToSet"
  | "$bit"
  | "$currentDate"
  | "$inc"
  | "$min"
  | "$max"
  | "$mul"
  | "$pop"
  | "$pull"
  | "$pullAll"
  | "$push"
  | "$rename"
  | "$set"
  | "$setOnInsert"
  | "$unset";

// ? This could be a single object but using an array is more flexible and allows for more complex mutations
// Much more features can be done (undo, redo, edit, editAllOf, remove, removeAllOf, etc)
export class UpdateBuilder<TSchema> {
  private readonly updates: UpdateFilter<TSchema>[] = [];

  build() {
    return this.updates.reduce((acc, update) => ({ ...acc, ...update }));
  }

  push(operator: UpdateOperator, fields: UpdateFilter<TSchema>) {
    this.updates.push({ [operator]: fields });
    return this;
  }

  // Operators

  $addToSet(fields: SetFields<TSchema>) {
    return this.push("$addToSet", fields);
  }

  $bit(fields: BitFields<TSchema>) {
    return this.push("$bit", fields);
  }

  $currentDate(fields: CurrentDateFields<TSchema>) {
    return this.push("$currentDate", fields);
  }

  $inc(fields: NumericFields<TSchema>) {
    return this.push("$inc", fields);
  }

  $min(fields: MatchKeysAndValues<TSchema>) {
    return this.push("$min", fields);
  }

  $max(fields: MatchKeysAndValues<TSchema>) {
    return this.push("$max", fields);
  }

  $mul(fields: NumericFields<TSchema>) {
    return this.push("$mul", fields);
  }

  $pop(fields: PopFields<TSchema>) {
    return this.push("$pop", fields);
  }

  $pull(fields: PullOperator<TSchema>) {
    return this.push("$pull", fields);
  }

  $pullAll(fields: PullAllOperator<TSchema>) {
    return this.push("$pullAll", fields);
  }

  $push(fields: PushOperator<TSchema>) {
    return this.push("$push", fields);
  }

  $rename(fields: RenameFields) {
    return this.push("$rename", fields);
  }

  $set(fields: MatchKeysAndValues<TSchema>) {
    return this.push("$set", fields);
  }

  $setOnInsert(fields: MatchKeysAndValues<TSchema>) {
    return this.push("$setOnInsert", fields);
  }

  $unset(fields: UnsetFields<TSchema>) {
    return this.push("$unset", fields);
  }
}
