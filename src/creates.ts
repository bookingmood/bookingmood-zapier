import { baseUrl } from "./data/constants";
import { ZapierCreates } from "./types/zapier";

const creates: ZapierCreates = {
  "invite-member": {
    key: "invite-member",
    noun: "Member",
    display: {
      label: "Invite Member",
      description:
        "Invite a member to your organization. The member will receive an email with a link to accept the invitation. The member will have the user role. To make a member admin or superuser use the dashboard.",
    },
    operation: {
      inputFields: [
        {
          key: "email",
          label: "Email",
          required: true,
          type: "string",
          helpText: "The email address of the member you want to invite.",
        },
        {
          key: "name",
          label: "Name",
          required: false,
          type: "string",
          helpText: "The name of the member you want to invite.",
        },
      ],
      async perform(z, bundle) {
        const res = await z.request({
          method: "POST",
          url: `${baseUrl}/invite-member`,
          body: bundle.inputData,
        });
        return res.data;
      },
      resource: "members",
    },
  },
  // "revoke-member": {
  //   key: "revoke-member",
  //   noun: "Member",
  //   display: {
  //     label: "Revoke Member",
  //     description:
  //       "Revoke a member from your organization. The member will no longer have access to your organization. Only works for members with the user role. To revoke an admin or superuser members use the dashboard.",
  //   },
  //   operation: {
  //     inputFields: [
  //       {
  //         key: "id",
  //         label: "Member ID",
  //         required: true,
  //         type: "string",
  //         helpText: "The ID of the member you want to revoke.",
  //         dynamic: "membersList.id",
  //       },
  //     ],
  //     async perform(z, bundle) {
  //       const res = await z.request({
  //         method: "POST",
  //         url: `${baseUrl}/revoke-member`,
  //         params: bundle.inputData,
  //       });
  //       return res.data;
  //     },
  //     outputFields: [{ key: "status", label: "Status", type: "string" }],
  //     sample: { status: "ok" },
  //   },
  // },
  "create-product": {
    key: "create-product",
    noun: "Product",
    display: {
      label: "Create Product",
      description:
        "Register a new unit in your organization. This action will automatically update your subscription.",
    },
    operation: {
      inputFields: [
        {
          key: "name",
          label: "Name",
          required: true,
          type: "string",
          helpText: "The name of the product you want to create.",
        },
        {
          key: "rent_period",
          label: "Rent Period",
          required: true,
          type: "string",
          choices: ["daily", "nightly"],
          helpText: "Rent period of the unit.",
          default: "nightly",
        },
        {
          key: "timezone",
          label: "Timezone",
          required: true,
          type: "string",
          helpText: "Timezone of the unit.",
          default: "UTC",
        },
      ],
      async perform(z, bundle) {
        const res = await z.request({
          method: "POST",
          url: `${baseUrl}/create-product`,
          body: {
            name: { default: bundle.inputData["name"] },
            rent_period: bundle.inputData["rent_period"],
            timezone: bundle.inputData["timezone"],
          },
        });
        return res.data;
      },
      resource: "products",
    },
  },
  // "delete-product": {
  //   key: "delete-product",
  //   noun: "Product",
  //   display: {
  //     label: "Delete Product",
  //     description:
  //       "Delete a unit from your organization. This will also delete all bookings for this unit. Your subscription will be adjusted automatically. This action cannot be undone.",
  //   },
  //   operation: {
  //     inputFields: [
  //       {
  //         key: "id",
  //         label: "Product",
  //         required: true,
  //         type: "string",
  //         helpText: "The product you want to delete.",
  //         dynamic: "productsList.id._label",
  //       },
  //     ],
  //     async perform(z, bundle) {
  //       const res = await z.request({
  //         method: "POST",
  //         url: `${baseUrl}/delete-product`,
  //         params: bundle.inputData,
  //       });
  //       return res.data;
  //     },
  //     outputFields: [{ key: "status", label: "Status", type: "string" }],
  //     sample: { status: "ok" },
  //   },
  // },
};

export default creates;
