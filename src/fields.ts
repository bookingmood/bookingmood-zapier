import type { PlainInputField } from "zapier-platform-core";

import type { Row } from "./api";
import {
  description,
  foreignKey,
  isLocalized,
  methods,
  notNull,
  properties,
  property,
  type Property,
  type Table,
} from "./spec";
import { sentenceCase } from "./strings";

// Columns Bookingmood fills in itself
const managedColumns = new Set([
  "created_at",
  "creator_id",
  "author_id",
  "deleted_at",
  "id",
  "organization_id",
  "uid",
  "updated_at",
]);

const hasGeneratedDefault = (property: Property) =>
  typeof property.default === "string" &&
  /^(auth\.uid|extensions\.uuid_generate|md5)\(/.test(property.default);

const isWritable = (column: string, property: Property) =>
  !managedColumns.has(column) &&
  !property.readOnly &&
  property.format !== "tsvector" &&
  !hasGeneratedDefault(property);

export const writableColumns = (table: Table) =>
  properties(table)
    .filter(([column, property]) => isWritable(column, property))
    .map(([column]) => column);

const isJson = (property: Property) =>
  (property.format === "jsonb" || property.format === "json") &&
  !isLocalized(property);

// Choices of columns that refer to another table come from that table's hidden list trigger
const dynamic = (property: Property) => {
  const reference = foreignKey(property);
  return reference && methods(`/${reference.table}`).includes("get")
    ? `${reference.table}List.${reference.column}._label`
    : undefined;
};

export const inputField = (
  table: Table,
  column: string,
  { required }: { required: boolean },
): PlainInputField => {
  const columnProperty = property(table, column) ?? {};
  const reference = dynamic(columnProperty);
  const field: PlainInputField = {
    key: column,
    label: reference
      ? sentenceCase(column.replace(/_id$/, ""))
      : sentenceCase(column),
    required,
  };

  const helpText = description(columnProperty);
  if (helpText) field.helpText = helpText;
  if (reference) field.dynamic = reference;

  const format = columnProperty.format ?? "";
  if (columnProperty.enum)
    field.choices = columnProperty.enum.map((value) => ({
      label: sentenceCase(value),
      sample: value,
      value,
    }));

  if (format.startsWith("timestamp")) field.type = "datetime";
  else if (format === "date") {
    field.type = "string";
    field.placeholder = "YYYY-MM-DD";
  } else if (columnProperty.type === "boolean") field.type = "boolean";
  else if (columnProperty.type === "integer") field.type = "integer";
  else if (columnProperty.type === "number") field.type = "number";
  else if (columnProperty.type === "array") {
    field.type = "string";
    field.list = true;
  } else if (isJson(columnProperty)) {
    field.type = "text";
    field.helpText = [helpText, "Enter the value as JSON."]
      .filter(Boolean)
      .join(" ");
  } else if (isLocalized(columnProperty)) {
    field.type = "string";
    field.helpText = [helpText, "Used for all languages."]
      .filter(Boolean)
      .join(" ");
  } else if (column === "notes" || column === "note") field.type = "text";
  else field.type = "string";

  if (
    typeof columnProperty.default !== "undefined" &&
    !hasGeneratedDefault(columnProperty) &&
    typeof columnProperty.default !== "object" &&
    !/\(\)$/.test(String(columnProperty.default)) &&
    columnProperty.default !== ""
  )
    field.default = String(columnProperty.default);

  return field;
};

// Required when creating: columns that can't be null and have no default
export const requiredOnCreate = (table: Table, column: string) => {
  const columnProperty = property(table, column);
  return (
    notNull(table, column) &&
    columnProperty?.default === undefined &&
    columnProperty?.type !== "boolean"
  );
};

// Zapier sends text, which becomes the shape the API expects
export const requestBody = (table: Table, inputData: Row) => {
  const body: Row = {};
  for (const [column, value] of Object.entries(inputData)) {
    const columnProperty = property(table, column);
    if (
      !columnProperty ||
      value === undefined ||
      value === null ||
      value === ""
    )
      continue;
    if (isLocalized(columnProperty)) body[column] = { default: String(value) };
    else if (isJson(columnProperty) && typeof value === "string")
      body[column] = JSON.parse(value);
    else if (columnProperty.format === "date" && typeof value === "string")
      body[column] = value.slice(0, 10);
    else body[column] = value;
  }
  return body;
};
