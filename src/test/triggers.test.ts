import { createAppTester, tools } from "zapier-platform-core";

import schema from "..";

const appTester = createAppTester(schema);
tools.env.inject();

describe("triggers", () => {
  describe("widget created trigger", () => {
    test("list widgets", async () => {
      const operation = schema.triggers?.["widgetsCreated"]?.operation;
      if (
        operation === undefined ||
        !("perform" in operation) ||
        typeof operation.perform !== "function"
      )
        throw new Error("Perform not found");
      const perform = operation.perform;
      const res = await appTester(perform, {
        inputData: {},
        cleanedRequest: {
          content: {
            payload: {
              new: {
                id: "1234",
              },
            },
          },
        },
      });
      console.log(res);
    });
  });
});
