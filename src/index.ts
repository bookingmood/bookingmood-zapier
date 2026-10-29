import { version as platformVersion } from "zapier-platform-core";
import type { App, Create, Trigger } from "zapier-platform-core";

import { actions } from "./actions";
import { addApiKey, handleErrors } from "./api";
import { authentication } from "./authentication";
import { tables } from "./spec";
import { resources, updates } from "./tables";
import { triggers } from "./triggers";

const { version } = require("../package.json") as { version: string };

const app: App<Record<string, Trigger>, Record<string, Create>> = {
  version,
  platformVersion,
  authentication,
  beforeRequest: [addApiKey],
  afterResponse: [handleErrors],
  // Input is converted per column in fields.ts, so it arrives as entered
  flags: { cleanInputData: false },
  resources: Object.fromEntries(
    resources(tables).map((resource) => [resource.key, resource]),
  ),
  triggers: triggers(),
  creates: { ...actions, ...updates(tables) },
};

export default app;
