import { describe, expect, test } from "vitest";

import { webhookEvents } from "../src/spec";
import { camelCase } from "../src/strings";
import {
  api,
  app,
  appTester,
  bundle,
  operation,
  organization,
  organizationRequest,
} from "./helpers";

const id = "00000000-0000-0000-0000-000000000001";

describe("webhook triggers", () => {
  test("there is a trigger for every webhook event, under the keys of 1.x", () => {
    expect(Object.keys(app.triggers)).toEqual(webhookEvents.map(camelCase));
    expect(app.triggers["calendarEventsConfirmed"]?.display.label).toBe(
      "Calendar Event Confirmed",
    );
    expect(app.triggers["bookingsCreated"]?.display.label).toBe("New Booking");
  });

  test("subscribing registers a Zapier webhook for the event", async () => {
    organizationRequest();
    api()
      .post("/webhooks", {
        description: "Zapier: New Booking",
        endpoint: "https://hooks.zapier.com/123",
        events: ["bookings.created"],
        organization_id: organization.id,
        source: "zapier",
      })
      .query({ select: "id" })
      .reply(201, [{ id }]);
    const result = await appTester(
      operation("triggers.bookingsCreated.operation.performSubscribe"),
      bundle({ targetUrl: "https://hooks.zapier.com/123" }),
    );
    expect(result).toEqual({ id });
  });

  test("unsubscribing deletes the webhook", async () => {
    api()
      .delete("/webhooks")
      .query({ id: `eq.${id}` })
      .reply(204);
    await appTester(
      operation("triggers.bookingsCreated.operation.performUnsubscribe"),
      bundle({ subscribeData: { id } }),
    );
  });

  test("notifications trigger with the new row", async () => {
    const result = await appTester(
      operation("triggers.bookingsCreated.operation.perform"),
      bundle({
        cleanedRequest: {
          id: "n1",
          event_type: "bookings.created",
          date: 0,
          payload: { old: null, new: { id, reference: "BM-1" } },
        },
      }),
    );
    expect(result).toEqual([{ id, reference: "BM-1", _label: "BM-1" }]);
  });

  test("member notifications are refetched to embed the user profile", async () => {
    api()
      .get("/members")
      .query({
        id: `eq.${id}`,
        select: "*,user_profile:user_profiles!inner(*)",
      })
      .reply(200, [{ id, user_profile: { name: "Pat" } }]);
    const result = await appTester(
      operation("triggers.membersCreated.operation.perform"),
      bundle({ cleanedRequest: { payload: { new: { id } } } }),
    );
    expect(result).toMatchObject([{ _label: "Pat" }]);
  });

  test("sample data for specific events only lists matching rows", async () => {
    api()
      .get("/payments")
      .query({
        limit: 3,
        select: "*",
        status: "eq.paid",
        order: "completed_at.desc.nullslast",
      })
      .reply(200, [{ id, reference: "P-1" }]);
    await appTester(
      operation("triggers.paymentsPaid.operation.performList"),
      bundle(),
    );
  });

  test("sample data for updates lists recently updated rows", async () => {
    api()
      .get("/contacts")
      .query({ limit: 3, select: "*", order: "updated_at.desc" })
      .reply(200, []);
    await appTester(
      operation("triggers.contactsUpdated.operation.performList"),
      bundle(),
    );
  });
});
