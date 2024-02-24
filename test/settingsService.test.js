const assert = require("chai").assert;
const path = require("path");
const settingsService = require(
  path.join("..", "server", "services", "settingsService")
);

it("should return the correct value", function () {
  const settingsFromRequest = { crs: { value: "ABC", key1: "something" } };

  const actual = settingsService.getValues(settingsFromRequest);

  assert.deepEqual(actual, { crs: "ABC" });
});
