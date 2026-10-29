import nock from "nock";
import { createAppTester } from "zapier-platform-core";
import { afterEach, beforeAll, expect } from "vitest";

import app from "../src";

export { app };

export const appTester = createAppTester(app);

export const apiKey = "11111111-2222-3333-4444-555555555555";
export const organization = {
  id: "00000000-0000-0000-0000-00000000000a",
  name: { default: "Seaside Cabins" },
};

export const bundle = <T extends object>(extra: T = {} as T) => ({
  authData: { api_key: apiKey },
  meta: { limit: 3, page: 0 },
  ...extra,
});

// Every request must carry the API key, and every mocked request must be made
export const api = () =>
  nock("https://api.bookingmood.com/v1", {
    reqheaders: { authorization: `Bearer ${apiKey}` },
  });

export const organizationRequest = () =>
  api()
    .get("/organizations")
    .query({ limit: 1, select: "id,name" })
    .reply(200, [organization]);

beforeAll(() => nock.disableNetConnect());
afterEach(() => {
  const pending = nock.pendingMocks();
  nock.cleanAll();
  expect(pending).toEqual([]);
});

// Zapier exposes compiled operations by key, resources included
export const operation = (path: string) => {
  const perform = path
    .split(".")
    .reduce<any>((value, key) => value?.[key], app);
  if (typeof perform !== "function")
    throw new Error(`${path} is not a function`);
  return perform as (...args: Array<any>) => any;
};
