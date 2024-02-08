import { firstBy } from "thenby";
import { Bundle, ZObject } from "zapier-platform-core";

import { spec } from "./data/api-spec";
import { baseUrl } from "./data/constants";
import {
  accessibleMethods,
  hiddenFields,
  labelColumns,
  multiLanguageFields,
} from "./data/methods";
import { OpenAPIParameter } from "./types/open-api";
import { ZapierField, ZapierFunction, ZapierResource } from "./types/zapier";
import { just } from "./utils/functions";
import { getPropertyExample } from "./utils/resources";
import { capitalCase, noCase, sentenceCase, singular } from "./utils/strings";

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
    noun: singular(sentenceCase(table)),
    create: methods.includes("post")
      ? {
          display: {
            label: `Create ${capitalCase(singular(table)).replace(
              " To ",
              "-To "
            )}`,
            description: `Create a new ${noCase(singular(table))}`,
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
              .flatMap<
                | ZapierField
                | ZapierFunction<(z: ZObject, bundle: Bundle) => ZapierField>
              >(([identifier, property]) => {
                if (identifier === "organization_id")
                  return [
                    (z, bundle) => ({
                      key: "organization_id",
                      label: "Organization",
                      required: true,
                      type: "string",
                      computed: true,
                      default: bundle.authData["organization_id"],
                    }),
                  ];

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

                if (hiddenFields.includes(`${table}.${identifier}`)) return [];

                if (multiLanguageFields.includes(`${table}.${identifier}`)) {
                  field.dict = false;
                  field.placeholder = "Default translation";
                  field.type = "string";
                }

                return [field];
              }),
            async perform(z, bundle) {
              const body = bundle.inputData;
              for (const [key, value] of Object.entries(body))
                if (multiLanguageFields.includes(`${table}.${key}`))
                  body[key] = { default: value };

              const res = await z.request({
                method: "POST",
                url: `${baseUrl}/${table}`,
                params: { select: "*" },
                body,
              });
              return res.data[0];
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
              const limit = bundle.meta.limit === -1 ? 1000 : bundle.meta.limit;
              const res = await z.request({
                url: `${baseUrl}/${table}`,
                params: { limit, offset: bundle.meta.page * limit },
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
            inputFields: (
              searchParameters
                ?.filter(
                  (p) =>
                    (p.name === "id" || p.name.endsWith("_id")) &&
                    p.name !== "ac_id"
                )
                .sort(
                  firstBy<OpenAPIParameter>((p) =>
                    p.name === "id" ? 0 : p.name.endsWith("_id") ? 1 : 2
                  ).thenBy((p) => p.name)
                ) ?? []
            ).flatMap<
              | ZapierField
              | ZapierFunction<(z: ZObject, bundle: Bundle) => ZapierField>
            >((parameter) => {
              if (
                (parameter.name === "id" ||
                  (parameter.name === "user_id" &&
                    table === "user_profiles")) &&
                labelColumns[table]
              )
                return [
                  {
                    key: parameter.name,
                    label: sentenceCase(parameter.name),
                    helpText: parameter.description,
                    required: parameter.required,
                    type: "string",
                    dynamic: `${table}List.${parameter.name}.${labelColumns[table]}`,
                  },
                ];

              if (parameter.name === "organization_id")
                return [
                  (z, bundle) => ({
                    key: "organization_id",
                    label: "Organization",
                    required: true,
                    type: "string",
                    computed: true,
                    default: bundle.authData["organization_id"],
                  }),
                ];

              if (parameter.name.endsWith("_id")) {
                const property = model?.properties[parameter.name];

                const fkRegex = /<fk table='(.*?)' column='(.*?)'\/>/g;
                const match = fkRegex.exec(property?.description ?? "");
                const fkTable = match?.[1];
                const fkColumn = match?.[2];

                if (fkTable && fkColumn && labelColumns[fkTable])
                  return [
                    {
                      key: parameter.name,
                      label: sentenceCase(parameter.name),
                      helpText: parameter.description,
                      required: parameter.required,
                      type: "string",
                      dynamic: `${fkTable}List.${fkColumn}.${labelColumns[fkTable]}`,
                    },
                  ];
              }

              return [];
            }),
            async perform(z, bundle) {
              const params: Record<string, unknown> = {};
              for (const [key, value] of Object.entries(bundle.inputData))
                params[key] = `eq.${value}`;

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
