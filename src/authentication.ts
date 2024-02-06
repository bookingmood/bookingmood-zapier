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
      key: "api_key",
      label: "API key",
      helpText:
        "API keys can be created and copied from [Bookingmood](https://www.bookingmood.com/admin) -> Settings -> API keys",
      required: true,
      type: "password",
    },
  ],
  test: (z) => z.request({ url: `${baseUrl}/products` }),
};

export default authentication;
