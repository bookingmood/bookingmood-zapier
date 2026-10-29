import openapi from "./generated/openapi.json";
import type { Columns, Table, WebhookEvent } from "./generated/spec-types";

export type { Columns, Table, WebhookEvent };

export type Property = {
  default?: unknown;
  description?: string;
  enum?: Array<string>;
  format?: string;
  items?: Property;
  readOnly?: boolean;
  type?: string;
};

type Schema = {
  enum?: Array<string>;
  properties?: Record<string, Property>;
  required?: Array<string>;
  "x-enum-descriptions"?: Record<string, string>;
};

type Spec = {
  components: { schemas: Record<string, Schema> };
  paths: Record<string, Record<string, unknown>>;
};

export const spec = openapi as unknown as Spec;

export const tables = Object.keys(spec.components.schemas)
  .filter((name) => `/${name}` in spec.paths)
  .sort() as Array<Table>;

export const methods = (path: string) => Object.keys(spec.paths[path] ?? {});

export const properties = (table: Table) =>
  Object.entries(spec.components.schemas[table]?.properties ?? {});

export const property = (table: Table, column: string) =>
  spec.components.schemas[table]?.properties?.[column];

// PostgREST marks columns that can't be null as required, even when they have a default
export const notNull = (table: Table, column: string) =>
  spec.components.schemas[table]?.required?.includes(column) ?? false;

export const hasColumn = (table: Table, column: string) =>
  property(table, column) !== undefined;

const webhookEventSchema = spec.components.schemas["WebhookEvent"];
export const webhookEvents = (webhookEventSchema?.enum ??
  []) as Array<WebhookEvent>;
export const webhookEventDescription = (event: WebhookEvent) =>
  webhookEventSchema?.["x-enum-descriptions"]?.[event] ?? event;

// Descriptions end in notes such as `<fk table='products' column='id'/>`
export const foreignKey = (property: Property) => {
  const match = /<fk table='(.*?)' column='(.*?)'\/>/.exec(
    property.description ?? "",
  );
  return match?.[1] && match[2]
    ? { column: match[2], table: match[1] as Table }
    : undefined;
};

export const description = (property: Property) =>
  property.description
    ?.split("\n\nNote:")[0]
    ?.replace(/\(\/docs\//g, "(https://www.bookingmood.com/docs/")
    .trim();

// Localized columns hold a translation per language, such as `{"default": "Cabin", "nl-NL": "Hut"}`
export const isLocalized = (property: Property) =>
  (property.format === "jsonb" || property.format === "json") &&
  /^Localized\b/.test(property.description ?? "");
