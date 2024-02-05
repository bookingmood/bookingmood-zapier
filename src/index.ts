import { noCase, sentenceCase } from "change-case";
import { firstBy } from "thenby";
import { version as platformVersion } from "zapier-platform-core";

import { ZapierApp, ZapierField, ZapierResource } from "./types/zapier";
import {
  accessibleMethods,
  getExampleValue,
  isStandardParameter,
  just,
} from "./utils";
import { OpenAPIParameter, OpenAPISpec } from "./types/open-api";

const { version } = require("../package.json");
const spec = require("../data/api-spec.json") as OpenAPISpec;

const resources = new Array<ZapierResource>();

for (const table of Object.keys(spec.definitions)
  .filter((table) => table in accessibleMethods)
  .sort()) {
  const methods = Object.keys(spec.paths[`/${table}`] ?? {}).filter((method) =>
    accessibleMethods[table]?.includes(method)
  );
  // const sections = Object.keys(spec.paths[`/${table}`] ?? {})
  //   .filter((method) => accessibleMethods[table]?.includes(method))
  //   .map((method) => ({
  //     id: method,
  //     label: `${
  //       method === "get"
  //         ? "List"
  //         : method === "post"
  //         ? "Create"
  //         : method === "patch"
  //         ? "Update"
  //         : method === "delete" && "Delete"
  //     } ${noCase(table)}`,
  //   }));

  const model = spec.definitions[table];

  const parameters = spec.paths[`/${table}`]?.get?.parameters
    .map(
      (parameter) =>
        spec.parameters[parameter.$ref.split("/").slice(-1)[0] ?? ""]
    )
    .flatMap(just);

  const queryParameters =
    parameters
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
      ) ?? [];

  resources.push({
    key: table,
    noun: sentenceCase(table),
    search: methods.includes("get")
      ? {
          display: {
            label: `List ${noCase(table)}`,
            description: `Search for a ${noCase(table)}`,
          },
          operation: {
            inputFields: queryParameters.map(
              (parameter) =>
                ({
                  key: parameter.name,
                  label: sentenceCase(parameter.name),
                  required: parameter.required,
                  type: parameter.type === "number" ? "integer" : "string",
                  helpText: parameter.description,
                } satisfies ZapierField)
            ),
            async perform(z, bundle) {
              const res = await z.request({
                url: `https://api.bookingmood.com/v1/${table}`,
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
          getExampleValue(property),
        ])
    ),
  });
}

const schema: ZapierApp = {
  version,
  platformVersion: platformVersion as `${number}.${number}.${number}`,

  triggers: {},

  resources: resources.reduce(
    (acc, resource) => ({ ...acc, [resource.key]: resource }),
    {}
  ),
};

export default schema;
