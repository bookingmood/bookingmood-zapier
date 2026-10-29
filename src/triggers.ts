import type { Bundle, Trigger, ZObject } from "zapier-platform-core";

import { baseUrl, organizationFetch, rows, type Row } from "./api";
import { eventFilters, tableConfigs } from "./config";
import {
  hasColumn,
  webhookEventDescription,
  webhookEvents,
  type Table,
  type WebhookEvent,
} from "./spec";
import { camelCase, titleCase } from "./strings";
import { noun, order, sample, select, withLabel } from "./tables";

const label = (event: WebhookEvent) => {
  const [table, verb = ""] = event.split(".") as [Table, string];
  if (verb === "created") return `New ${noun(table)}`;
  if (verb === "updated") return `Updated ${noun(table)}`;
  return `${noun(table)} ${titleCase(verb)}`;
};

// "A booking was created" -> "Triggers when a booking is created."
const description = (event: WebhookEvent) =>
  `Triggers when ${webhookEventDescription(event)
    .replace(/^A(n?) /, "a$1 ")
    .replace(" was ", " is ")}.`;

const trigger = (event: WebhookEvent): Trigger => {
  const [table] = event.split(".") as [Table];
  const filter = eventFilters[event];
  const listOrder =
    filter?.order ??
    (event.endsWith(".updated") && hasColumn(table, "updated_at")
      ? "updated_at.desc"
      : order(table));

  return {
    key: camelCase(event),
    noun: noun(table),
    display: {
      label: label(event),
      description: description(event),
    },
    operation: {
      type: "hook",
      resource: table,
      // Notifications are `{ id, event_type, date, payload: { old, new } }`
      perform: async (z: ZObject, bundle: Bundle) => {
        const row = (
          bundle.cleanedRequest as { payload?: { new?: Row } } | undefined
        )?.payload?.new;
        if (!row) return [];
        // Embed the same related rows as the sample data
        if (tableConfigs[table]?.select && row["id"]) {
          const response = await z.request({
            url: `${baseUrl}/${table}`,
            params: { id: `eq.${row["id"]}`, select: select(table) },
          });
          return rows(response).map(withLabel(table));
        }
        return [withLabel(table)(row)];
      },
      performList: async (z: ZObject, bundle: Bundle) => {
        const limit = bundle.meta.limit > 0 ? bundle.meta.limit : 3;
        const response = await z.request({
          url: `${baseUrl}/${table}`,
          params: {
            limit,
            select: select(table),
            ...filter?.filter,
            ...(listOrder ? { order: listOrder } : {}),
          },
        });
        return rows(response).map(withLabel(table));
      },
      performSubscribe: async (z: ZObject, bundle: Bundle) => {
        const organization = await organizationFetch(z);
        const response = await z.request({
          method: "POST",
          url: `${baseUrl}/webhooks`,
          params: { select: "id" },
          body: {
            description: `Zapier: ${label(event)}`,
            endpoint: bundle.targetUrl,
            events: [event],
            organization_id: organization.id,
            source: "zapier",
          },
        });
        return rows(response)[0];
      },
      performUnsubscribe: async (z: ZObject, bundle: Bundle) => {
        const { id } = (bundle.subscribeData ?? {}) as { id?: string };
        if (!id) return {};
        await z.request({
          method: "DELETE",
          url: `${baseUrl}/webhooks`,
          params: { id: `eq.${id}` },
        });
        return { id };
      },
      sample: sample(table),
    },
  };
};

export const triggers = (): Record<string, Trigger> =>
  Object.fromEntries(
    webhookEvents.map((event) => [camelCase(event), trigger(event)]),
  );
