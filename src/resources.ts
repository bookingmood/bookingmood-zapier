import { firstBy } from "thenby";
import { Bundle, ZObject } from "zapier-platform-core";

import { accessibleMethods, labelColumns } from "./data/accessible-methods";
import { spec } from "./data/api-spec";
import { baseUrl } from "./data/constants";
import { OpenAPIParameter } from "./types/open-api";
import { ZapierField, ZapierResource } from "./types/zapier";
import { just } from "./utils/functions";
import {
  getParamExample,
  getPropertyExample,
  isStandardParameter,
} from "./utils/resources";
import { capitalCase, noCase, sentenceCase } from "./utils/strings";

const specEnums = Object.values(spec.definitions)
  .flatMap((table) => Object.values(table.properties))
  .reduce<Record<string, Array<string>>>((acc, property) => {
    if ("enum" in property && property.enum && property.format)
      acc[property.format] = property.enum;
    return acc;
  }, {});

const resources = new Array<ZapierResource>();

for (const table of Object.keys(spec.definitions)
  .filter((table) => table in accessibleMethods)
  .sort()) {
  const methods = Object.keys(spec.paths[`/${table}`] ?? {}).filter((method) =>
    accessibleMethods[table]?.includes(method)
  );

  const model = spec.definitions[table];

  const searchParameters = spec.paths[`/${table}`]?.get?.parameters
    ?.map(
      (parameter) =>
        spec.parameters[
          "$ref" in parameter
            ? parameter.$ref.split("/").slice(-1)[0] ?? ""
            : ""
        ]
    )
    .flatMap(just);

  resources.push({
    key: table,
    noun: sentenceCase(table),
    create: methods.includes("post")
      ? {
          display: {
            label: `Create ${capitalCase(table).replace(" To ", "-To ")}`,
            description: `Create a new ${noCase(table)}`,
          },
          operation: {
            inputFields: Object.entries(model?.properties ?? {})
              .filter(
                ([identifier]) =>
                  identifier !== "fts" &&
                  identifier !== "id" &&
                  identifier !== "created_at" &&
                  identifier !== "updated_at" &&
                  identifier !== "deleted_at" &&
                  identifier !== "uid"
              )
              .map(([identifier, property]) => {
                if (identifier === "organization_id")
                  return (z, bundle) => ({
                    key: "organization_id",
                    label: "Organization",
                    required: true,
                    type: "string",
                    computed: true,
                    default: bundle.authData["organization_id"],
                  });

                const enumValue = specEnums[property.format ?? ""];

                const field: ZapierField = {
                  key: identifier,
                  label: sentenceCase(identifier),
                  helpText: `${property.description
                    ?.replace("Note:", "")
                    .replace("This is a Primary Key.<pk/>", "")
                    .replace(
                      /This is a Foreign Key to `.*?`.<fk table='.*?' column='.*?'\/>/g,
                      ""
                    )
                    .trim()} (${
                    enumValue
                      ? enumValue.map((v) => `"${v}"`).join(" | ")
                      : property.format
                  })`,
                };

                if (enumValue)
                  field.choices = enumValue.map((value) => ({
                    label: sentenceCase(value),
                    sample: value,
                    value,
                  }));

                const example = enumValue?.[0] ?? getPropertyExample(property);
                if (example)
                  field.placeholder =
                    typeof example === "string"
                      ? example
                      : JSON.stringify(example);

                if (
                  property.format === "timestamp with time zone" ||
                  property.format === "timestamp without time zone"
                )
                  field.type = "datetime";
                else if (property.format === "boolean") field.type = "boolean";
                else if (property.type === "integer") field.type = "integer";
                else if (property.type === "number") field.type = "number";
                else if (property.format === "text[]") {
                  field.type = "string";
                  field.list = true;
                } else if (property.format === "boolean[]") {
                  field.type = "boolean";
                  field.list = true;
                } else if (property.format === "jsonb") {
                  field.type = "string";
                  field.dict = true;
                } else field.type = "string";

                if (identifier.endsWith("_id")) {
                  const fkRegex = /<fk table='(.*?)' column='(.*?)'\/>/g;
                  const match = fkRegex.exec(property.description ?? "");
                  const fkTable = match?.[1];
                  const fkColumn = match?.[2];

                  if (fkTable && fkColumn && labelColumns[fkTable])
                    field.dynamic = `${fkTable}List.${fkColumn}.${labelColumns[fkTable]}`;
                }

                return field;
              }),
            async perform(z, bundle) {
              const res = await z.request({
                method: "POST",
                url: `${baseUrl}/${table}`,
                params: { select: "*" },
                body: bundle.inputData,
              });
              return res.data;
            },
          },
        }
      : undefined,
    list: methods.includes("get")
      ? {
          display: {
            label: `List ${capitalCase(table).replace(" To ", "-To ")}`,
            description: `List all ${noCase(table)}`,
            hidden: true,
          },
          operation: {
            canPaginate: true,
            type: "polling",
            perform: async (z, bundle) => {
              const res = await z.request({
                url: `${baseUrl}/${table}`,
                params: {
                  offset: bundle.meta.page,
                  limit: bundle.meta.limit === -1 ? 1000 : bundle.meta.limit,
                },
              });
              return res.data;
            },
          },
        }
      : undefined,
    search: methods.includes("get")
      ? {
          display: {
            label: `Search ${capitalCase(table).replace(" To ", "-To ")}`,
            description: `Search ${noCase(table)}`,
          },
          operation: {
            inputFields: [
              ...(
                searchParameters
                  ?.filter(
                    (p) =>
                      p.in === "query" &&
                      p.name !== "order" &&
                      p.name !== "ac_id" &&
                      p.name !== "uid" &&
                      !isStandardParameter(p)
                  )
                  .sort(
                    firstBy<OpenAPIParameter>((p) =>
                      p.name === "id"
                        ? 0
                        : p.name.endsWith("_id")
                        ? 1
                        : p.name === "created_at"
                        ? 2
                        : p.name === "updated_at"
                        ? 3
                        : p.name === "deleted_at"
                        ? 4
                        : 5
                    ).thenBy((p) => p.name)
                  ) ?? []
              ).map((parameter) => {
                if (
                  (parameter.name === "id" ||
                    (parameter.name === "user_id" &&
                      table === "user_profiles")) &&
                  labelColumns[table]
                )
                  return {
                    key: parameter.name,
                    label: sentenceCase(parameter.name),
                    helpText: parameter.description,
                    required: parameter.required,
                    type: "string",
                    dynamic: `${table}List.${parameter.name}.${labelColumns[table]}`,
                  } as ZapierField;

                if (parameter.name === "organization_id")
                  return (z: ZObject, bundle: Bundle) =>
                    ({
                      key: "organization_id",
                      label: "Organization",
                      required: true,
                      type: "string",
                      computed: true,
                      default: bundle.authData["organization_id"],
                    } as ZapierField);

                if (parameter.name.endsWith("_id")) {
                  const property = model?.properties[parameter.name];

                  const fkRegex = /<fk table='(.*?)' column='(.*?)'\/>/g;
                  const match = fkRegex.exec(property?.description ?? "");
                  const fkTable = match?.[1];
                  const fkColumn = match?.[2];

                  if (fkTable && fkColumn && labelColumns[fkTable])
                    return {
                      key: parameter.name,
                      label: sentenceCase(parameter.name),
                      helpText: parameter.description,
                      required: parameter.required,
                      type: "string",
                      list: true,
                      dynamic: `${fkTable}List.${fkColumn}.${labelColumns[fkTable]}`,
                    } as ZapierField;
                }

                const enumValue = specEnums[parameter.format ?? ""];

                const field: ZapierField = {
                  key: parameter.name,
                  label: sentenceCase(parameter.name),
                  required: parameter.required,
                  type: "string",
                  helpText: `${parameter.description} (${
                    enumValue
                      ? enumValue.map((v) => `"${v}"`).join(", ")
                      : parameter.format
                  })`,
                };

                if (
                  parameter.format === "integer" ||
                  parameter.type === "integer"
                )
                  field.type = "integer";
                if (
                  parameter.format === "number" ||
                  parameter.type === "number"
                )
                  field.type = "number";
                if (
                  parameter.format === "timestamp with time zone" ||
                  parameter.format === "timestamp without time zone"
                )
                  field.type = "datetime";
                if (parameter.format === "boolean") field.type = "boolean";
                if (parameter.format === "boolean[]") {
                  field.type = "boolean";
                  field.list = true;
                }
                if (parameter.format === "text[]") {
                  field.type = "string";
                  field.list = true;
                }

                const example = enumValue?.[0] ?? getParamExample(parameter);
                if (example) field.placeholder = example;

                return field;
              }),
              {
                key: "limit",
                label: "Limit",
                required: false,
                type: "integer",
                helpText: "The number of records to return",
                placeholder: "1000",
              },
              {
                key: "offset",
                label: "Offset",
                required: false,
                type: "integer",
                helpText: "The number of records to skip",
                placeholder: "0",
              },
              {
                key: "select",
                label: "Select",
                required: false,
                type: "string",
                helpText:
                  "The columns to return, separated by commas. See [our API reference](https://www.bookingmood.com/en-US/api-reference#selecting) for more information",
                placeholder: "*",
              },
              {
                key: "order",
                label: "Order",
                required: false,
                type: "string",
                helpText: "Column to sort by",
                placeholder: "id",
                choices: Object.entries(model?.properties ?? {})
                  .filter(([identifier]) => identifier !== "fts")
                  .flatMap(([identifier]) => [
                    {
                      label: `${sentenceCase(identifier)} (ascending)`,
                      sample: `${identifier}.asc`,
                      value: `${identifier}.asc`,
                    },
                    {
                      label: `${sentenceCase(identifier)} (descending)`,
                      sample: `${identifier}.desc`,
                      value: `${identifier}.desc`,
                    },
                  ]),
              },
            ],
            async perform(z, bundle) {
              const params: Record<string, unknown> = {};
              for (const [key, value] of Object.entries(bundle.inputData))
                params[key] =
                  key.endsWith("_id") &&
                  Array.isArray(value) &&
                  value.length > 0
                    ? `in.${value.join(",")}`
                    : `eq.${value}`;

              const res = await z.request({
                url: `${baseUrl}/${table}`,
                params,
              });
              return res.data;
            },
          },
        }
      : undefined,
    sample: Object.fromEntries(
      Object.entries(model?.properties ?? {})
        .filter(([identifier]) => identifier !== "fts")
        .sort(
          firstBy(([identifier]) =>
            identifier === "id"
              ? 0
              : identifier.endsWith("_id")
              ? 1
              : identifier === "created_at"
              ? 2
              : identifier === "updated_at"
              ? 3
              : identifier === "deleted_at"
              ? 4
              : 5
          ).thenBy(([identifier]) => identifier)
        )
        .map(([identifier, property]) => [
          identifier,
          getPropertyExample(property),
        ])
    ),
  });
}

export default resources;
