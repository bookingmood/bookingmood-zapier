import { OpenAPIParameter, OpenAPIProperty } from "../types/open-api";

export function getPropertyExample(property: OpenAPIProperty) {
  if ("enum" in property && property.enum !== undefined)
    return property.default ?? property.enum[0];
  if (property.format === "uuid") return "00000000-0000-0000-0000-000000000000";
  if (property.format === "text") return property.default ?? "";
  if (property.format === "timestamp with time zone")
    return new Date().toISOString();
  if (property.format === "timestamp without time zone")
    return new Date().toISOString().replace("Z", "");
  if (property.format === "boolean") return property.default ?? false;
  if (property.type === "integer") return property.default ?? 0;
  if (property.type === "number") return property.default ?? 0.0;
  if (property.format === "text[]") return property.default ?? [""];
  if (property.format === "boolean[]") return property.default ?? [false];
  if (property.format === "jsonb") return property.default ?? {};
  if (property.format === "tsvector") return property.default ?? "";
  if (property.format === "tsrange") return property.default ?? "[)";
  if (property.format === "tsmultirange") return property.default ?? "{}";

  return null;
}

export function getParamExample(param: OpenAPIParameter) {
  if (param.format === "uuid") return "00000000-0000-0000-0000-000000000000";
  if (param.format === "text") return param.default ?? "";
  if (param.format === "timestamp with time zone")
    return new Date().toISOString();
  if (param.format === "timestamp without time zone")
    return new Date().toISOString().replace("Z", "");
  if (param.format === "boolean") return param.default ?? false;
  if (param.type === "integer") return param.default ?? 0;
  if (param.type === "number") return param.default ?? 0.0;
  if (param.format === "text[]") return param.default ?? JSON.stringify([""]);
  if (param.format === "boolean[]")
    return param.default ?? JSON.stringify([false]);
  if (param.format === "jsonb") return param.default ?? JSON.stringify({});
  if (param.format === "tsvector") return param.default ?? "";
  if (param.format === "tsrange") return param.default ?? "[)";
  if (param.format === "tsmultirange") return param.default ?? "{}";

  return null;
}

export function isStandardParameter(parameter: OpenAPIParameter) {
  return (
    parameter.name === "select" ||
    parameter.name === "offset" ||
    (parameter.name === "order" && parameter.description === "Ordering") ||
    parameter.name === "limit"
  );
}
