import { ZapierField } from "../types/zapier";

export const accessibleMethods: Record<string, Array<string>> = {
  attribute_options: ["get", "post", "patch", "delete"],
  attributes: ["get", "post", "patch", "delete"],
  booking_details: ["get", "post", "patch", "delete"],
  booking_updates: ["get"],
  bookings: ["get", "post", "patch", "delete"],
  calendar_event_notes: ["get", "post", "patch", "delete"],
  calendar_event_tasks: ["get", "post", "patch", "delete"],
  calendar_event_updates: ["get"],
  calendar_events: ["get", "post", "patch", "delete"],
  contact_bookings: ["get", "post", "patch", "delete"],
  contacts: ["get", "post", "patch", "delete"],
  coupon_products: ["get", "post", "patch", "delete"],
  coupon_services: ["get", "post", "patch", "delete"],
  coupon_uses: ["get"],
  coupons: ["get", "post", "patch", "delete"],
  email_events: ["get"],
  email_templates: ["get", "post", "patch", "delete"],
  emails: ["get"],
  external_calendars: ["get", "post", "patch", "delete"],
  invoices: ["get", "post", "patch", "delete"],
  line_item_taxes: ["get", "post", "patch", "delete"],
  line_items: ["get", "post", "patch", "delete"],
  members: ["get"],
  occupancy_group_dependencies: ["get", "post", "patch", "delete"],
  occupancy_groups: ["get", "post", "patch", "delete"],
  payments: ["get", "post", "patch", "delete"],
  permissions: ["get", "post", "patch", "delete"],
  product_attribute_options: ["get", "post", "patch", "delete"],
  product_calendar_logs: ["get"],
  product_configurations: ["get", "post", "patch", "delete"],
  product_email_templates: ["get", "post", "patch", "delete"],
  product_occupancies: ["get", "post", "patch", "delete"],
  product_reply_to_addresses: ["get", "post", "patch", "delete"],
  product_services: ["get", "post", "patch", "delete"],
  product_tasks: ["get", "post", "patch", "delete"],
  products: ["get", "patch"],
  reply_to_addresses: ["get", "post", "patch", "delete"],
  seasons: ["get", "post", "patch", "delete"],
  service_deposit_moments: ["get", "post", "patch", "delete"],
  service_discounts: ["get", "post", "patch", "delete"],
  service_payment_moments: ["get", "post", "patch", "delete"],
  service_taxes: ["get", "post", "patch", "delete"],
  services: ["get", "post", "patch", "delete"],
  site_listings: ["get", "post", "patch", "delete"],
  site_nav_items: ["get", "post", "patch", "delete"],
  site_pages: ["get", "post", "patch", "delete"],
  site_views: ["get"],
  sites: ["get", "patch"],
  taxes: ["get", "post", "patch", "delete"],
  user_profiles: ["get", "patch"],
  widget_listings: ["get", "post", "patch", "delete"],
  widget_views: ["get"],
  widgets: ["get", "post", "patch", "delete"],
};

export const labelGenerators: Record<
  string,
  (row: Record<string, any>) => unknown
> = {
  attribute_options: (row) => row["name"]?.["default"],
  attributes: (row) => row["name"]?.["default"],
  booking_details: (row) => row["name"]?.["default"],
  booking_updates: (row) => row["id"],
  bookings: (row) => row["reference"],
  calendar_event_notes: (row) => row["note"],
  calendar_event_tasks: (row) => row["label"] || "Final cleaning",
  calendar_event_updates: (row) => row["id"],
  calendar_events: (row) => row["title"] || row["generated_title"],
  contact_bookings: (row) => row["id"],
  contacts: (row) => row["name"] || row["email"] || row["phone"],
  coupon_products: (row) => row["id"],
  coupon_services: (row) => row["id"],
  coupon_uses: (row) => row["id"],
  coupons: (row) => row["code"],
  email_events: (row) => row["id"],
  email_templates: (row) => row["subject"],
  emails: (row) => row["id"],
  external_calendars: (row) => row["name"] || row["ical_url"],
  invoices: (row) => row["reference"],
  line_item_taxes: (row) => row["name"]?.["default"],
  line_items: (row) => row["name"]?.["default"],
  members: (row) => row["id"],
  occupancy_group_dependencies: (row) => row["id"],
  occupancy_groups: (row) => row["name"]?.["default"],
  payments: (row) => row["reference"],
  permissions: (row) => row["id"],
  product_attribute_options: (row) => row["id"],
  product_calendar_logs: (row) => row["id"],
  product_configurations: (row) => row["name"]?.["default"],
  product_email_templates: (row) => row["id"],
  product_occupancies: (row) => row["id"],
  product_reply_to_addresses: (row) => row["id"],
  product_services: (row) => row["id"],
  product_tasks: (row) => row["label"] || "Final cleaning",
  products: (row) => row["name"]?.["default"],
  reply_to_addresses: (row) => row["email"],
  seasons: (row) => row["name"]?.["default"],
  service_deposit_moments: (row) => row["id"],
  service_discounts: (row) => row["name"]?.["default"],
  service_payment_moments: (row) => row["id"],
  service_taxes: (row) => row["id"],
  services: (row) => row["label"]?.["default"],
  site_listings: (row) => row["slug"]?.["default"],
  site_nav_items: (row) => row["label"]?.["default"],
  site_pages: (row) => row["title"]?.["default"],
  site_views: (row) => row["id"],
  sites: (row) => row["subdomain"],
  taxes: (row) => row["label"]?.["default"],
  user_profiles: (row) => row["email"],
  widget_listings: (row) => row["id"],
  widget_views: (row) => row["id"],
  widgets: (row) => row["title"],
};

export const multiLanguageFields = [
  "attribute_options.name",
  "attributes.name",
  "booking_details.name",
  "email_templates.body",
  "email_templates.subject",
  "google_vr_listings.url",
  "google_vr_listings.partner_hygiene_link",
  "line_item_taxes.name",
  "line_items.name",
  "occupancy_groups.description",
  "occupancy_groups.name",
  "occupancy_groups.name_singular",
  "product_configurations.name",
  "products.confirmation_message",
  "products.cta",
  "products.description",
  "products.name",
  "seasons.name",
  "service_discounts.name",
  "services.description",
  "services.label",
  "site_listings.slug",
  "site_nav_items.label",
  "site_pages.slug",
  "site_pages.title",
  "site_pages.description",
  "site_pages.content",
  "sites.name",
  "taxes.label",
  "widget_listings.url",
];

export const hiddenFields = [
  "attributes.order",
  "booking_details.option_id",
  "booking_details.service_id",
  "bookings.occupancy",
  "bookings.secret",
  "bookings.silent",
  "bookings.site_id",
  "bookings.widget_id",
  "calendar_event_notes.author_id",
  "calendar_event_tasks.notification_sent_at",
  "calendar_event_tasks.product_task_id",
  "calendar_events.calendar_id",
  "calendar_events.creator_id",
  "calendar_events.generated_title",
  "calendar_events.padding",
  "contacts.address",
  "contacts.creator_id",
  "contacts.name",
  "email_templates.attachments",
  "external_calendars.active",
  "external_calendars.error",
  "external_calendars.last_synced_at",
  "external_calendars.sync_requested_at",
  "line_items.service_id",
  "payments.paid",
  "product_configurations.check_in_days",
  "product_configurations.checkout_days",
  "product_configurations.early_bird_adjustments",
  "product_configurations.intervals",
  "product_configurations.last_minute_adjustments",
  "product_configurations.long_rent_adjustments",
  "product_configurations.order",
  "product_configurations.rates",
  "product_email_templates.order",
  "product_services.order",
  "products.images",
  "seasons.value",
  "services.deposit",
  "services.meta",
  "services.order",
  "services.price",
  "site_listings.order",
  "site_nav_items.order",
  "widget_listings.order",
  "widgets.visible_months",
];

export const customFields: Record<
  string,
  {
    definition?: (field: ZapierField) => ZapierField;
    interpeter?: (value: any) => unknown;
  }
> = {
  "calendar_events.end_date": {
    definition: (field) => ({ ...field, type: "datetime" }),
  },
  "calendar_events.origin": {
    definition: (field) => ({
      ...field,
      computed: true,
      default: "zapier",
      type: "string",
      helpText: undefined,
    }),
  },
  "calendar_events.start_date": {
    definition: (field) => ({ ...field, type: "datetime" }),
  },
  "coupons.definition": {
    definition: (field) => ({
      key: "definition",
      label: "Discount Percentage",
      helpText: "The discount this coupon applies on its scope.",
      default: "5",
      required: true,
      type: "number",
    }),
    interpeter: (value: number) => {
      return { restrictions: [], type: "relative", value: -value };
    },
  },
  "coupons.code": {
    interpeter: (value: string) => {
      return value.toUpperCase().replace(/[^A-Z0-9]/g, "_");
    },
  },
  "email_templates.trigger": {
    definition: (field) => ({
      ...field,
      choices: [
        {
          value: "booking-updated",
          sample: "booking-updated",
          label: "When booking is updated",
        },
        {
          value: "booking-request-received",
          sample: "booking-request-received",
          label: "Upon receiving a booking request",
        },
        {
          value: "booking-request-confirmed",
          sample: "booking-request-confirmed",
          label: "Upon confirming a booking request",
        },
        {
          value: "booking-request-pending",
          sample: "booking-request-pending",
          label: "Upon setting a booking request to pending",
        },
        {
          value: "booking-request-rejected",
          sample: "booking-request-rejected",
          label: "Upon rejecting a booking request",
        },
        {
          value: "invoice-created",
          sample: "invoice-created",
          label: "When an invoice is created",
        },
        {
          value: "payment-received",
          sample: "payment-received",
          label: "When a payment is received",
        },
      ],
    }),
  },
  "email_templates.moment": {
    // { type: "check-in" | "checkout" | "confirmation" | "request", offset: integer }
    definition: (field) => ({
      key: "moment",
      label: "Moment",
      children: [
        {
          key: "moment.type",
          label: "Point around which to send the email",
          required: true,
          default: "check-in",
          choices: [
            { value: "check-in", sample: "check-in", label: "Arrival" },
            { value: "checkout", sample: "checkout", label: "Departure" },
            {
              value: "confirmation",
              sample: "confirmation",
              label: "Booking confirmation",
            },
            { value: "request", sample: "request", label: "Initial request" },
          ],
        },
        {
          key: "moment.offset",
          label: "Offset",
          required: true,
          type: "integer",
          default: "0",
          helpText: "The number of days before or after the moment.",
        },
      ],
    }),
    interpeter: (
      value: [{ "moment.type": string; "moment.offset": number }]
    ) => ({ type: value[0]["moment.type"], offset: value[0]["moment.offset"] }),
  },
  "line_items.item_type": {
    definition: (field) => ({
      ...field,
      computed: true,
      default: "fee",
      type: "string",
      helpText: undefined,
    }),
  },
  "product_tasks.moment": {
    // { type: "check-in" | "checkout" | "confirmation" | "request", offset: integer }
    definition: (field) => ({
      key: "moment",
      label: "Moment",
      children: [
        {
          key: "moment.type",
          label: "Anchor point around which to schedule the task",
          required: true,
          default: "check-in",
          choices: [
            { value: "check-in", sample: "check-in", label: "Arrival" },
            { value: "checkout", sample: "checkout", label: "Departure" },
          ],
        },
        {
          key: "moment.offset",
          label: "Offset",
          required: true,
          type: "integer",
          default: "0",
          helpText: "The number of days before or after the anchor point.",
        },
      ],
    }),
    interpeter: (
      value: [{ "moment.type": string; "moment.offset": number }]
    ) => ({ type: value[0]["moment.type"], offset: value[0]["moment.offset"] }),
  },
  "services.type": {
    definition: (field) => ({
      ...field,
      choices: [
        { value: "address", sample: "address", label: "Guest address" },
        { value: "checkbox", sample: "checkbox", label: "Checkbox" },
        { value: "email", sample: "email", label: "Guest email address" },
        { value: "long-text", sample: "long-text", label: "Multi-line text" },
        {
          value: "multiple-choice",
          sample: "multiple-choice",
          label: "Multiple-choice",
        },
        {
          value: "multiple-choice-option",
          sample: "multiple-choice-option",
          label: "Multiple-choice option",
        },
        { value: "name", sample: "name", label: "Guest name" },
        { value: "number", sample: "number", label: "Number" },
        { value: "phone", sample: "phone", label: "Guest phone number" },
        {
          value: "short-text",
          sample: "short-text",
          label: "Single-line text",
        },
        { value: "statement", sample: "statement", label: "Fee / description" },
        { value: "time", sample: "time", label: "Time" },
      ],
    }),
  },
  "service_deposit_moments.moment": {
    definition: (field) => ({
      key: "moment",
      label: "Moment",
      children: [
        {
          key: "moment.type",
          label: "Anchor point around which to schedule the deposit",
          required: true,
          default: "check-in",
          choices: [
            { value: "check-in", sample: "check-in", label: "Arrival" },
            { value: "checkout", sample: "checkout", label: "Departure" },
            {
              value: "confirmation",
              sample: "confirmation",
              label: "Booking confirmation",
            },
            { value: "request", sample: "request", label: "Initial request" },
          ],
        },
        {
          key: "moment.offset",
          label: "Offset",
          required: true,
          type: "integer",
          default: "0",
          helpText: "The number of days before or after the anchor point.",
        },
      ],
    }),
    interpeter: (
      value: [{ "moment.type": string; "moment.offset": number }]
    ) => ({ type: value[0]["moment.type"], offset: value[0]["moment.offset"] }),
  },
  "service_deposit_moments.value": {
    definition: (field) => ({
      key: "value",
      label: "Amount",
      helpText: "As percentage of total.",
      default: "50",
      required: true,
      type: "number",
    }),
    interpeter: (value: number) => {
      return { restrictions: [], type: "relative", value };
    },
  },
  "service_discounts.definition": {
    definition: (field) => ({
      key: "definition",
      label: "Discount percentage",
      helpText: "As percentage of total.",
      default: "20",
      required: true,
      type: "number",
    }),
    interpeter: (value: number) => {
      return { restrictions: [], type: "relative", value: -value };
    },
  },
  "service_payment_moments.moment": {
    definition: (field) => ({
      key: "moment",
      label: "Moment",
      children: [
        {
          key: "moment.type",
          label: "Anchor point around which to schedule the deposit",
          required: true,
          default: "check-in",
          choices: [
            { value: "check-in", sample: "check-in", label: "Arrival" },
            { value: "checkout", sample: "checkout", label: "Departure" },
            {
              value: "confirmation",
              sample: "confirmation",
              label: "Booking confirmation",
            },
            { value: "request", sample: "request", label: "Initial request" },
          ],
        },
        {
          key: "moment.offset",
          label: "Offset",
          required: true,
          type: "integer",
          default: "0",
          helpText: "The number of days before or after the anchor point.",
        },
      ],
    }),
    interpeter: (
      value: [{ "moment.type": string; "moment.offset": number }]
    ) => ({ type: value[0]["moment.type"], offset: value[0]["moment.offset"] }),
  },
  "service_payment_moments.value": {
    definition: (field) => ({
      key: "value",
      label: "Amount",
      helpText: "As percentage of total.",
      default: "50",
      required: true,
      type: "number",
    }),
    interpeter: (value: number) => {
      return { restrictions: [], type: "relative", value };
    },
  },
};
