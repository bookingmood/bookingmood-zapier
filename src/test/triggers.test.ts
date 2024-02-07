import triggers from "../triggers";

describe("triggers", () => {
  test("should log all triggers", () => {
    console.log(triggers.map((trigger) => trigger.display.label));
  });
});
