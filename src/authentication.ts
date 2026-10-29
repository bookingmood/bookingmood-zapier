import type { Authentication, Bundle, ZObject } from "zapier-platform-core";

import { organizationFetch } from "./api";

// API keys belong to one organization, so the key is all Zapier needs.
// Connections made before 2.0 also stored an organization name and ID, which are no longer used.
export const authentication: Authentication = {
  type: "custom",
  fields: [
    {
      key: "api_key",
      label: "API key",
      required: true,
      type: "password",
      helpText:
        "Create an API key in [Bookingmood](https://www.bookingmood.com/admin) under Settings → API keys.",
    },
  ],
  test: async (z: ZObject, bundle: Bundle) => {
    const key = String(bundle.authData["api_key"] ?? "").trim();
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        key,
      )
    )
      throw new z.errors.Error(
        "The API key is invalid. Copy it from Settings → API keys in Bookingmood.",
        "invalid_api_key",
        400,
      );
    const organization = await organizationFetch(z);
    return { id: organization.id, name: organization.name?.["default"] ?? "" };
  },
  connectionLabel: "{{name}}",
};
