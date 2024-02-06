import resources from "../resources";

describe("resources", () => {
  test("should log all resources", () => {
    console.log(resources[0]?.create?.operation.inputFields);
  });
});
