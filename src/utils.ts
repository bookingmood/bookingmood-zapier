import type { OpenAPIProperty, OpenAPISpec } from "./types";

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
  coupon_uses: ["get", "post", "patch", "delete"],
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
  site_views: ["get", "post", "patch", "delete"],
  sites: ["get", "patch"],
  taxes: ["get", "post", "patch", "delete"],
  user_profiles: ["get", "post", "patch", "delete"],
  widget_listings: ["get", "post", "patch", "delete"],
  widget_views: ["get", "post", "patch", "delete"],
  widgets: ["get", "post", "patch", "delete"],
};

export function getExampleValue(property: OpenAPIProperty) {
  if (property.enum !== undefined) return property.default ?? property.enum[0];
  if (property.format === "uuid") return "00000000-0000-0000-0000-000000000000";
  if (property.format === "text") return property.default ?? "";
  if (property.format === "timestamp with time zone")
    return new Date().toISOString();
  if (property.format === "timestamp without time zone")
    return new Date().toISOString().replace("Z", "");
  if (property.format === "boolean") return property.default ?? false;
  if (property.type === "integer") return property.default ?? 0;
  if (property.type === "number") return property.default ?? 0.0;
  if (property.format === "text[]") return property.default ?? [""];
  if (property.format === "boolean[]") return property.default ?? [false];
  if (property.format === "jsonb") return property.default ?? {};
  if (property.format === "tsvector") return property.default ?? "";
  if (property.format === "tsrange") return property.default ?? "[)";
  if (property.format === "tsmultirange") return property.default ?? "{}";

  return null;
}
