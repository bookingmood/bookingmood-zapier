import { version as platformVersion } from "zapier-platform-core";
import MovieCreate from "./creates/movie";
import MovieTrigger from "./triggers/movie";
import { OpenAPISpec } from "./types";

const { version } = require("../package.json");
const apiSpec = require("../data/api-spec.json") as OpenAPISpec;

console.log(apiSpec);

export default {
  version,
  platformVersion,

  triggers: {
    [MovieTrigger.key]: MovieTrigger,
  },

  creates: {
    [MovieCreate.key]: MovieCreate,
  },
};
