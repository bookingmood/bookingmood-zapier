import { Bundle, HttpRequestOptions, ZObject } from "zapier-platform-core";

import MovieCreate from "./creates/movie";
import MovieTrigger from "./triggers/movie";
import { version as platformVersion } from "zapier-platform-core";

const { version } = require("../package.json");

export default {
  version,
  platformVersion,

  beforeRequest: [
    (req: HttpRequestOptions, z: ZObject, bundle: Bundle) => {
      // Hard-coded api key just to demo. DON'T do auth like this for your production app!
      req.headers = req.headers || {};
      req.headers["X-Api-Key"] = "secret";
      return req;
    },
  ],

  triggers: {
    [MovieTrigger.key]: MovieTrigger,
  },

  creates: {
    [MovieCreate.key]: MovieCreate,
  },
};
