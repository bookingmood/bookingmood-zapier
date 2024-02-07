import { version as platformVersion } from "zapier-platform-core";

import authentication from "./authentication";
import resources from "./resources";
import triggers from "./triggers";
import { ZapierApp } from "./types/zapier";

const { version } = require("../package.json");

const schema: ZapierApp = {
  version,
  platformVersion: platformVersion as `${number}.${number}.${number}`,

  authentication,

  beforeRequest: [
    (request, z, bundle) => {
      request.headers = {
        ...request.headers,
        Authorization: `Bearer ${bundle.authData["api_key"]}`,
      };
      return request;
    },
  ],

  resources: resources.reduce(
    (acc, resource) => ({ ...acc, [resource.key]: resource }),
    {}
  ),
  triggers: triggers.reduce(
    (acc, trigger) => ({ ...acc, [trigger.key]: trigger }),
    {}
  ),
};

export default schema;
