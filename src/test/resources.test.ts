import resources from "../resources";

describe("resources", () => {
  test("should log all resources", () => {
    console.log(
      resources?.find((r) => r.key === "payments")?.search?.operation
        .inputFields?.[0]
    );
  });
});
