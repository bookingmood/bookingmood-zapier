// Actions backed by custom endpoints instead of a single table.
// Before 2.0 the member and unit actions had keys like `invite-member`, which Zapier no longer allows.
import type { Bundle, Create, ZObject } from "zapier-platform-core";

import { baseUrl, type Row } from "./api";
import { property } from "./spec";
import { sample, withLabel } from "./tables";

const languageChoices = (property("contacts", "language")?.enum ?? []).map(
  (value) => ({ label: value, sample: value, value }),
);

const rentPeriodChoices = (property("products", "rent_period")?.enum ?? []).map(
  (value) => ({
    label: value === "daily" ? "Per day" : "Per night",
    sample: value,
    value,
  }),
);

export const actions: Record<string, Create> = {
  inviteMember: {
    key: "inviteMember",
    noun: "Member",
    display: {
      label: "Invite Member",
      description:
        "Invites someone to your organization with the user role. They receive an email with a link to accept the invitation. Make members admin or superuser in the dashboard.",
    },
    operation: {
      inputFields: [
        {
          key: "email",
          label: "Email",
          required: true,
          type: "string",
          helpText: "Email address of the person to invite.",
        },
        {
          key: "name",
          label: "Name",
          required: false,
          type: "string",
          helpText: "Name of the person to invite.",
        },
        {
          key: "language",
          label: "Language",
          required: false,
          type: "string",
          choices: languageChoices,
          helpText: "Language of the invitation and the dashboard.",
        },
      ],
      perform: async (z: ZObject, bundle: Bundle) => {
        const { email, language, name } = bundle.inputData as Row;
        const response = await z.request({
          method: "POST",
          url: `${baseUrl}/members`,
          body: {
            email,
            ...(language ? { language } : {}),
            ...(name ? { name } : {}),
          },
        });
        return withLabel("members")(response.data as Row);
      },
      sample: sample("members"),
    },
  },
  revokeMember: {
    key: "revokeMember",
    noun: "Member",
    display: {
      label: "Revoke Member",
      description:
        "Removes a member with the user role from your organization. Revoke admins and superusers in the dashboard.",
    },
    operation: {
      inputFields: [
        {
          key: "id",
          label: "Member",
          required: true,
          type: "string",
          dynamic: "membersList.id._label",
          helpText: "The member to revoke.",
        },
      ],
      perform: async (z: ZObject, bundle: Bundle) => {
        const response = await z.request({
          method: "DELETE",
          url: `${baseUrl}/members`,
          params: { id: String(bundle.inputData["id"]) },
        });
        return withLabel("members")(response.data as Row);
      },
      sample: sample("members"),
    },
  },
  createProduct: {
    key: "createProduct",
    noun: "Unit",
    display: {
      label: "Create Unit",
      description:
        "Creates a unit with sensible defaults. Your subscription is updated automatically.",
    },
    operation: {
      inputFields: [
        {
          key: "name",
          label: "Name",
          required: true,
          type: "string",
          helpText: "Name of the unit.",
        },
        {
          key: "rent_period",
          label: "Rent Period",
          required: true,
          type: "string",
          choices: rentPeriodChoices,
          default: "nightly",
          helpText: "Whether the unit is rented per night or per day.",
        },
        {
          key: "timezone",
          label: "Timezone",
          required: true,
          type: "string",
          default: "UTC",
          helpText: "IANA timezone of the unit, e.g. `Europe/Amsterdam`.",
        },
      ],
      perform: async (z: ZObject, bundle: Bundle) => {
        const { name, rent_period, timezone } = bundle.inputData as Row;
        const response = await z.request({
          method: "POST",
          url: `${baseUrl}/products`,
          body: { name: { default: name }, rent_period, timezone },
        });
        return withLabel("products")(response.data as Row);
      },
      sample: sample("products"),
    },
  },
  deleteProduct: {
    key: "deleteProduct",
    noun: "Unit",
    display: {
      label: "Delete Unit",
      description:
        "Deletes a unit and its bookings. Your subscription is updated automatically. This can't be undone.",
    },
    operation: {
      inputFields: [
        {
          key: "id",
          label: "Unit",
          required: true,
          type: "string",
          dynamic: "productsList.id._label",
          helpText: "The unit to delete.",
        },
      ],
      perform: async (z: ZObject, bundle: Bundle) => {
        const response = await z.request({
          method: "DELETE",
          url: `${baseUrl}/products`,
          params: { id: String(bundle.inputData["id"]) },
        });
        return withLabel("products")(response.data as Row);
      },
      sample: sample("products"),
    },
  },
};
