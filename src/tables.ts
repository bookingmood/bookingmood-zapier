import type {
  Bundle,
  Create,
  PlainInputField,
  Resource,
  ZObject,
} from "zapier-platform-core";

import { baseUrl, organizationFetch, rows, singleRow, type Row } from "./api";
import { tableConfigs, type TableConfig } from "./config";
import {
  inputField,
  requestBody,
  requiredOnCreate,
  writableColumns,
} from "./fields";
import { hasColumn, methods, properties, type Table } from "./spec";
import { sentenceCase, singular, titleCase } from "./strings";

const config = (table: Table) =>
  (tableConfigs[table] ?? {}) as TableConfig<Table>;

export const noun = (table: Table) =>
  config(table).noun ?? titleCase(singular(table));

export const select = (table: Table) => config(table).select ?? "*";

const defaultLabel = (row: Row) => {
  for (const key of ["name", "title", "label", "reference", "email"]) {
    const value = row[key];
    if (typeof value === "string" && value) return value;
    if (value && typeof value === "object" && "default" in value)
      return (value as { default: unknown }).default;
  }
  return row["id"];
};

export const withLabel = (table: Table) => (row: Row) =>
  ({
    ...row,
    _label: String(
      (config(table).label ?? defaultLabel)(row) || row["id"] || "",
    ),
  }) as Row & { id: string; _label: string };

export const order = (table: Table) =>
  hasColumn(table, "created_at") ? "created_at.desc" : undefined;

// Embedded rows in a select, such as `user_profile:user_profiles!inner(*)`
const embeds = (table: Table) =>
  [...select(table).matchAll(/(\w+):(\w+)(?:!\w+)?\(\*\)/g)].map(
    ([, alias = "", embedded = ""]) => [alias, embedded as Table] as const,
  );

const columnSamples = (table: Table): Row =>
  Object.fromEntries(
    properties(table)
      .filter(([, property]) => property.format !== "tsvector")
      .map(([column, property]) => {
        if (property.enum)
          return [column, property.default ?? property.enum[0]];
        if (property.format === "uuid")
          return [column, "00000000-0000-0000-0000-000000000000"];
        if (property.format?.startsWith("timestamp"))
          return [column, "2026-01-01T12:00:00+00:00"];
        if (property.format === "date") return [column, "2026-01-01"];
        if (property.type === "boolean")
          return [column, property.default ?? false];
        if (property.type === "integer" || property.type === "number")
          return [column, 0];
        if (property.type === "array") return [column, []];
        if (property.format === "jsonb" || property.format === "json")
          return [column, {}];
        return [column, ""];
      }),
  );

// A row with an example value per column, for the Zap editor before real data exists
export const sample = (table: Table): Row =>
  withLabel(table)({
    ...columnSamples(table),
    ...Object.fromEntries(
      embeds(table).map(([alias, embedded]) => [
        alias,
        columnSamples(embedded),
      ]),
    ),
  });

const withOrganization = async (z: ZObject, table: Table, body: Row) =>
  hasColumn(table, "organization_id")
    ? { ...body, organization_id: (await organizationFetch(z)).id }
    : body;

const listPerform = (table: Table) => async (z: ZObject, bundle: Bundle) => {
  const limit = bundle.meta.limit > 0 ? bundle.meta.limit : 100;
  const response = await z.request({
    url: `${baseUrl}/${table}`,
    params: {
      limit,
      offset: (bundle.meta.page ?? 0) * limit,
      select: select(table),
      ...(order(table) ? { order: order(table) } : {}),
    },
  });
  return rows(response).map(withLabel(table));
};

const createInputFields = (table: Table): Array<PlainInputField> => {
  const columns = config(table).create?.columns ?? writableColumns(table);
  return columns.map((column) =>
    inputField(table, column, { required: requiredOnCreate(table, column) }),
  );
};

const createPerform = (table: Table) => async (z: ZObject, bundle: Bundle) => {
  const response = await z.request({
    method: "POST",
    url: `${baseUrl}/${table}`,
    params: { select: select(table) },
    body: await withOrganization(
      z,
      table,
      requestBody(table, bundle.inputData),
    ),
  });
  return withLabel(table)(singleRow(response, z));
};

const searchPerform = (table: Table) => async (z: ZObject, bundle: Bundle) => {
  const params: Record<string, string> = { select: select(table), limit: "10" };
  for (const [column, operator] of Object.entries(
    config(table).search?.columns ?? {},
  )) {
    const value = bundle.inputData[column];
    if (value === undefined || value === null || value === "") continue;
    params[column] = operator === "ilike" ? `ilike.*${value}*` : `eq.${value}`;
  }
  if (Object.keys(params).length === 2)
    throw new z.errors.Error(
      "Fill in at least one field to search by",
      "invalid_input",
      400,
    );
  const response = await z.request({
    url: `${baseUrl}/${table}`,
    params: { ...params, ...(order(table) ? { order: order(table) } : {}) },
  });
  return rows(response).map(withLabel(table));
};

const customCreateTables = new Set<Table>(["members", "products"]);

// Resources combine a hidden list trigger for dropdowns, a create, and a search
const resource = (table: Table): Resource => {
  const tableMethods = methods(`/${table}`);
  const tableConfig = config(table);
  const entity = noun(table);

  const result: Resource = { key: table, noun: entity, sample: sample(table) };

  if (tableMethods.includes("get"))
    result.list = {
      display: {
        label: `List ${titleCase(table)}`,
        description: `Lists ${sentenceCase(table).toLowerCase()}, to pick from in dropdowns.`,
        hidden: true,
      },
      operation: { canPaginate: true, perform: listPerform(table) },
    };

  // Custom endpoints replace the generic create of some tables
  if (tableMethods.includes("post") && !customCreateTables.has(table))
    result.create = {
      display: {
        label: `Create ${entity}`,
        description:
          tableConfig.create?.description ??
          `Creates a new ${entity.toLowerCase()}.`,
        hidden: !tableConfig.create,
      },
      operation: {
        inputFields: createInputFields(table),
        perform: createPerform(table),
      },
    };

  if (tableConfig.search)
    result.search = {
      display: {
        label: `Find ${entity}`,
        description: tableConfig.search.description,
      },
      operation: {
        // A single search field is required, with several any combination works
        inputFields: Object.keys(tableConfig.search.columns).map(
          (column, _, columns) =>
            inputField(table, column, { required: columns.length === 1 }),
        ),
        perform: searchPerform(table),
      },
    };

  return result;
};

export const resources = (tables: Array<Table>) => tables.map(resource);

// Updates aren't part of Zapier resources, so they are creates of their own
export const updates = (tables: Array<Table>): Record<string, Create> =>
  Object.fromEntries(
    tables.flatMap((table) => {
      const update = config(table).update;
      if (!update || !methods(`/${table}`).includes("patch")) return [];
      const entity = noun(table);
      const key = `${table}Update`;
      const create: Create = {
        key,
        noun: entity,
        display: { label: `Update ${entity}`, description: update.description },
        operation: {
          inputFields: [
            {
              key: "id",
              label: entity,
              required: true,
              type: "string",
              dynamic: `${table}List.id._label`,
              helpText: `The ${entity.toLowerCase()} to update.`,
            },
            ...update.columns.map((column) =>
              inputField(table, column, { required: false }),
            ),
          ],
          perform: async (z: ZObject, bundle: Bundle) => {
            const { id, ...changes } = bundle.inputData as Row;
            const response = await z.request({
              method: "PATCH",
              url: `${baseUrl}/${table}`,
              params: { id: `eq.${id}`, select: select(table) },
              body: requestBody(table, changes),
            });
            return withLabel(table)(singleRow(response, z));
          },
          sample: sample(table),
        },
      };
      return [[key, create]];
    }),
  );
