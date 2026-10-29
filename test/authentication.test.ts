import { describe, expect, test } from "vitest";

import {
  app,
  appTester,
  bundle,
  organization,
  organizationRequest,
} from "./helpers";

describe("authentication", () => {
  test("labels the connection with the organization of the API key", async () => {
    organizationRequest();
    const result = await appTester(app.authentication!.test as any, bundle());
    expect(result).toEqual({ id: organization.id, name: "Seaside Cabins" });
    expect(app.authentication?.connectionLabel).toBe("{{name}}");
  });

  test("rejects keys that aren't UUIDs without calling the API", async () => {
    await expect(
      appTester(app.authentication!.test as any, {
        authData: { api_key: "nope" },
      }),
    ).rejects.toThrow("The API key is invalid");
  });
});
