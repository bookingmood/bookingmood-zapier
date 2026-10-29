import { describe, expect, test } from "vitest";

import {
  api,
  appTester,
  bundle,
  operation,
  organization,
  organizationRequest,
} from "./helpers";

const id = "00000000-0000-0000-0000-000000000001";

describe("custom actions", () => {
  test("create unit posts a localized name to /products", async () => {
    api()
      .post("/products", {
        name: { default: "Cabin" },
        rent_period: "nightly",
        timezone: "UTC",
      })
      .reply(201, { id, name: { default: "Cabin" } });
    const result = await appTester(
      operation("creates.createProduct.operation.perform"),
      bundle({
        inputData: { name: "Cabin", rent_period: "nightly", timezone: "UTC" },
      }),
    );
    expect(result).toMatchObject({ id, _label: "Cabin" });
  });

  test("delete unit deletes by id", async () => {
    api()
      .delete("/products")
      .query({ id })
      .reply(200, { id, name: { default: "Cabin" } });
    await appTester(
      operation("creates.deleteProduct.operation.perform"),
      bundle({ inputData: { id } }),
    );
  });

  test("invite member leaves out empty fields", async () => {
    api()
      .post("/members", { email: "pat@example.com" })
      .reply(201, {
        id,
        user_profile: { email: "pat@example.com", name: null },
      });
    const result = await appTester(
      operation("creates.inviteMember.operation.perform"),
      bundle({ inputData: { email: "pat@example.com", name: "" } }),
    );
    expect(result).toMatchObject({ _label: "pat@example.com" });
  });

  test("revoke member deletes by id", async () => {
    api().delete("/members").query({ id }).reply(200, { id });
    await appTester(
      operation("creates.revokeMember.operation.perform"),
      bundle({ inputData: { id } }),
    );
  });

  test("API errors surface their message", async () => {
    api()
      .delete("/members")
      .query({ id })
      .reply(400, "Only members with the user role can be revoked via the API");
    await expect(
      appTester(
        operation("creates.revokeMember.operation.perform"),
        bundle({ inputData: { id } }),
      ),
    ).rejects.toThrow(
      "Only members with the user role can be revoked via the API",
    );
  });
});

describe("table actions", () => {
  test("create contact adds the organization and drops empty fields", async () => {
    organizationRequest();
    api()
      .post("/contacts", {
        email: "guest@example.com",
        first_name: "Sam",
        organization_id: organization.id,
        sms_opt_in: false,
      })
      .query({ select: "*" })
      .reply(201, [{ id, name: "Sam", email: "guest@example.com" }]);
    const result = await appTester(
      operation("resources.contacts.create.operation.perform"),
      bundle({
        inputData: {
          email: "guest@example.com",
          first_name: "Sam",
          last_name: "",
          sms_opt_in: false,
        },
      }),
    );
    expect(result).toMatchObject({ id, _label: "Sam" });
  });

  test("localized columns get a default translation and JSON columns are parsed", async () => {
    organizationRequest();
    api()
      .post(
        "/capacity_groups",
        (body) =>
          body.name?.default === "Adults" &&
          body.organization_id === organization.id,
      )
      .query(true)
      .reply(201, [{ id, name: { default: "Adults" } }]);
    await appTester(
      operation("resources.capacity_groups.create.operation.perform"),
      bundle({ inputData: { name: "Adults" } }),
    );
  });

  test("update contact patches only the filled in fields", async () => {
    api()
      .patch("/contacts", { phone: "+31600000000" })
      .query({ id: `eq.${id}`, select: "*" })
      .reply(200, [{ id, name: "Sam" }]);
    await appTester(
      operation("creates.contactsUpdate.operation.perform"),
      bundle({ inputData: { id, phone: "+31600000000", email: "" } }),
    );
  });

  test("update fails when the row doesn't exist", async () => {
    api().patch("/tasks").query(true).reply(200, []);
    await expect(
      appTester(
        operation("creates.tasksUpdate.operation.perform"),
        bundle({ inputData: { id, completed_at: "2026-01-01T10:00:00Z" } }),
      ),
    ).rejects.toThrow("Not found");
  });

  test("find contact combines filters and matches names partially", async () => {
    api()
      .get("/contacts")
      .query({
        email: "eq.guest@example.com",
        name: "ilike.*Sam*",
        select: "*",
        limit: "10",
        order: "created_at.desc",
      })
      .reply(200, [{ id, name: "Sam" }]);
    const result = await appTester(
      operation("resources.contacts.search.operation.perform"),
      bundle({ inputData: { email: "guest@example.com", name: "Sam" } }),
    );
    expect(result).toHaveLength(1);
  });

  test("find contact needs a value to search by", async () => {
    await expect(
      appTester(
        operation("resources.contacts.search.operation.perform"),
        bundle({ inputData: {} }),
      ),
    ).rejects.toThrow("Fill in at least one field");
  });

  test("list members embeds user profiles for their labels", async () => {
    api()
      .get("/members")
      .query({
        limit: 3,
        offset: 0,
        select: "*,user_profile:user_profiles!inner(*)",
        order: "created_at.desc",
      })
      .reply(200, [
        { id, user_profile: { name: "Pat", email: "pat@example.com" } },
      ]);
    const result = await appTester(
      operation("resources.members.list.operation.perform"),
      bundle(),
    );
    expect(result).toMatchObject([{ _label: "Pat" }]);
  });
});
