import { version as platformVersion } from "zapier-platform-core";

import authentication from "./authentication";
import resources from "./resources";
import { ZapierApp } from "./types/zapier";

const { version } = require("../package.json");

const schema: ZapierApp = {
  version,
  platformVersion: platformVersion as `${number}.${number}.${number}`,

  authentication,

  resources: resources.reduce(
    (acc, resource) => ({ ...acc, [resource.key]: resource }),
    {}
  ),
  beforeRequest: [
    (request, z, bundle) => {
      request.headers = {
        ...request.headers,
        Authorization: `Bearer ${bundle.authData["api_key"]}`,
      };
      return request;
    },
  ],
};

export default schema;
