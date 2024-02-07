import { baseUrl } from "./data/constants";
import { webhookEventDescriptions } from "./data/triggers";
import { ZapierTrigger } from "./types/zapier";
import { camelCase, capitalCase, sentenceCase } from "./utils/strings";

const triggers = new Array<ZapierTrigger>();

for (const event in webhookEventDescriptions)
  triggers.push({
    key: camelCase(event),
    noun: sentenceCase(event.replace(".", " ")),
    display: {
      label: capitalCase(event.replace(".", " ")),
      description: `Triggers when ${webhookEventDescriptions[
        event as keyof typeof webhookEventDescriptions
      ].toLowerCase()}.`,
    },
    operation: {
      perform(z, bundle) {
        return bundle.cleanedRequest?.content["payload"]["new"];
      },
      async performSubscribe(z, bundle) {
        const res = await z.request({
          method: "POST",
          url: `${baseUrl}/webhooks?select=id,signing_secret`,
          body: {
            description: `Zapier webhook for ${event}`,
            endpoint: bundle.targetUrl,
            events: [event],
            organization_id: bundle.authData["organization_id"],
            source: "zapier",
          },
        });
        return res.data;
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

export default triggers;
