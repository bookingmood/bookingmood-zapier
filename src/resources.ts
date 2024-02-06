import { firstBy } from "thenby";

import { accessibleMethods } from "./data/accessible-methods";
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
            label: `Create ${sentenceCase(table)}`,
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
                  identifier !== "deleted_at"
              )
              .map(([identifier, property]) => {
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

                return field;
              }),
            async perform(z, bundle) {
              const res = await z.request({
                method: "POST",
                url: `${baseUrl}/${table}`,
                body: bundle.inputData,
              });
              return res.data;
            },
          },
        }
      : undefined,
    search: methods.includes("get")
      ? {
          display: {
            label: `List ${capitalCase(table)}`,
            description: `Search and filter ${noCase(table)}`,
          },
          operation: {
            inputFields: [
              ...(
                searchParameters
                  ?.filter((p) => p.in === "query" && !isStandardParameter(p))
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
                const enumValue = specEnums[parameter.format ?? ""];
                const field: ZapierField = {
                  key: parameter.name,
                  label: sentenceCase(parameter.name),
                  required: parameter.required,
                  type: "string",
                  helpText: `${parameter.description} Filter<${
                    enumValue
                      ? enumValue.map((v) => `"${v}"`).join(", ")
                      : parameter.format
                  }>. See [our API reference](https://www.bookingmood.com/en-US/api-reference#filtering) for all filter options`,
                };
                const example = enumValue?.[0] ?? getParamExample(parameter);
                if (example) field.placeholder = `eq.${example}`;

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
              const res = await z.request({
                url: `${baseUrl}/${table}`,
                params: bundle.inputData,
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
