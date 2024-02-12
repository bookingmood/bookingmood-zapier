import { baseUrl } from "./data/constants";
import { selects } from "./data/methods";
import { webhookEventDescriptions } from "./data/triggers";
import { ZapierTrigger } from "./types/zapier";
import {
  camelCase,
  capitalCase,
  sentenceCase,
  singular,
} from "./utils/strings";

const triggers = new Array<ZapierTrigger>();

for (const event in webhookEventDescriptions) {
  const [table = "", verb = ""] = event.split(".");
  const noun = singular(sentenceCase(table));
  triggers.push({
    key: camelCase(event),
    noun,
    display: {
      label: capitalCase(`${noun} ${verb}`),
      description: `Triggers when ${webhookEventDescriptions[
        event as keyof typeof webhookEventDescriptions
      ].toLowerCase()}.`,
    },
    operation: {
      type: "hook",
      canPaginate: true,
      perform(z, bundle) {
        const row = bundle.cleanedRequest?.payload?.new;
        return row ? [row] : [];
      },
      async performList(z, bundle) {
        const limit = bundle.meta.limit === -1 ? 1000 : bundle.meta.limit;

        const res = await z.request({
          method: "GET",
          url: `${baseUrl}/${table}`,
          params: {
            limit,
            offset: bundle.meta.page * limit,
            order: verb === "created" ? "created_at.desc" : "updated_at.desc",
            select: selects[table] ?? "*",
          },
        });

        return res.data;
      },
      async performSubscribe(z, bundle) {
        const res = await z.request({
          method: "POST",
          url: `${baseUrl}/webhooks`,
          params: {
            select: "id",
          },
          body: {
            description: `Zapier webhook for ${event}`,
            endpoint: bundle.targetUrl,
            events: [event],
            organization_id: bundle.authData["organization_id"],
            source: "zapier",
          },
        });
        return res.data[0];
      },
      async performUnsubscribe(z, bundle) {
        const res = await z.request({
          method: "DELETE",
          url: `${baseUrl}/webhooks?id=eq.${bundle.subscribeData?.id}`,
        });
        return res.data;
      },
      resource: event.split(".")[0],
    },
  });
}

export default triggers;
