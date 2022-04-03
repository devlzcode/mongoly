import { describe, expect, it } from "vitest";
import { UpdateBuilder } from "../lib";

describe("UpdateBuilder", () => {
  it("Should properly build the updates", () => {
    const target = {
      $set: { bestFriend: { name: "Bob" } },
      $push: { friends: { name: "Jill" } },
    };
    const updateBuilder = new UpdateBuilder();
    updateBuilder.$set(target.$set).$push(target.$push);
    expect(updateBuilder.build()).toEqual(target);
  });
});
