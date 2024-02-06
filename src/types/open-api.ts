export type OpenAPIMethod = {
  description?: string;
  parameters?: Array<{ $ref: `#/parameters/${string}` } | object>;
  produces?: Array<string>;
  responses: Record<
    string,
    {
      description: string;
      schema?: { items: { $ref: `#/definitions/${string}` }; type: "array" };
    }
  >;
  summary?: string;
  tags: Array<string>;
};

export type OpenAPIParameter = {
  default?: string;
  description?: string;
  enum?: Array<string>;
  format?: string;
  in: "query" | "header" | "body";
  name: string;
  required: boolean;
  schema?: { $ref: `#/definitions/${string}` };
  type?: string;
};

export type OpenAPIProperty = {
  default?: unknown;
  description?: string;
} & (
  | {
      items: OpenAPIProperty;
      format: string;
      type: "array";
    }
  | {
      enum?: Array<string>;
      format?: string;
      type?: string;
    }
  | {
      format?: string;
      maxLength?: number;
      type: "string";
    }
);

export type OpenAPIDefinition = {
  description?: string;
  required?: Array<string>;
  properties: Record<string, OpenAPIProperty>;
  type?: "object";
};

export type OpenAPISpec = {
  basePath: string;
  consumes: Array<string>;
  definitions: Record<string, OpenAPIDefinition>;
  externalDocs: { description: string; url: string };
  host: string;
  info: { description: string; title: string; version: string };
  parameters: Record<string, OpenAPIParameter>;
  paths: Record<
    string,
    { [method in "get" | "post" | "delete" | "patch"]?: OpenAPIMethod }
  >;
  produces: Array<string>;
  schemes: Array<string>;
  swagger: string;
};
