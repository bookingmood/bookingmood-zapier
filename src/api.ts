import type {
  BeforeRequestMiddleware,
  HttpResponse,
  ZObject,
} from "zapier-platform-core";

export const baseUrl = "https://api.bookingmood.com/v1";

export type Row = Record<string, unknown>;

export const addApiKey: BeforeRequestMiddleware = (request, z, bundle) => {
  request.headers = {
    ...request.headers,
    Authorization: `Bearer ${bundle.authData["api_key"]}`,
  };
  return request;
};

// Errors are `{ code, details, hint, message }`, or plain text from custom endpoints
export const handleErrors = (response: HttpResponse, z: ZObject) => {
  if (response.status === 401)
    throw new z.errors.RefreshAuthError(
      "The API key is invalid or was revoked. Reconnect your Bookingmood account with a new API key.",
    );
  if (response.status >= 400) {
    const json = response.json as
      | { message?: string; hint?: string }
      | undefined;
    const message =
      [json?.message, json?.hint].filter(Boolean).join(". ") ||
      response.content ||
      `Bookingmood responded with status ${response.status}`;
    throw new z.errors.Error(
      message,
      `http_${response.status}`,
      response.status,
    );
  }
  return response;
};

// API keys belong to a single organization, which is the only one they can read
export const organizationFetch = async (z: ZObject) => {
  const response = await z.request({
    url: `${baseUrl}/organizations`,
    params: { limit: 1, select: "id,name" },
  });
  const organization = (
    response.data as Array<{ id: string; name: Record<string, string> }>
  )[0];
  if (!organization)
    throw new z.errors.Error(
      "The API key does not give access to an organization",
      "no_organization",
      403,
    );
  return organization;
};

export const rows = (response: HttpResponse) => response.data as Array<Row>;

export const singleRow = (response: HttpResponse, z: ZObject) => {
  const row = rows(response)[0];
  if (!row) throw new z.errors.Error("Not found", "not_found", 404);
  return row;
};
