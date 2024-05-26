import { baseUrl } from "./data/constants";
import { ZapierAuthentication } from "./types/zapier";

const authentication: ZapierAuthentication = {
  type: "custom",
  connectionLabel: (z, bundle) => bundle.authData["organization_name"],
  fields: [
    {
      key: "organization_name",
      label: "Organization name",
      helpText:
        "Name of your organization in [Bookingmood](https://www.bookingmood.com/admin)",
      required: false,
      type: "string",
    },
    {
      key: "organization_id",
      label: "Organization ID",
      helpText:
        "ID of your organization in [Bookingmood](https://www.bookingmood.com/admin). Visible in the url as /admin/organizations/{{organization_id}}/...",
      required: true,
      type: "string",
    },
    {
      key: "api_key",
      label: "API key",
      helpText:
        "API keys can be created and copied from [Bookingmood](https://www.bookingmood.com/admin) -> Settings -> API keys",
      required: true,
      type: "password",
    },
  ],
  test: async (z, bundle) => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
    const organization_id = bundle.authData["organization_id"];
    const api_key = bundle.authData["api_key"];
    if (!organization_id || !uuidRegex.test(organization_id))
      throw new z.errors.Error(
        "Organization ID is invalid",
        "InvalidData",
        400
      );
    if (!api_key || !uuidRegex.test(api_key))
      throw new z.errors.Error("API key is invalid", "InvalidData", 400);
    return await z.request({ url: `${baseUrl}/products` });
  },
};

export default authentication;
