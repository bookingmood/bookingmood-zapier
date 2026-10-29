// What the integration offers. Every table in the API gets hidden list and create operations, which
// power dropdowns and keep older Zaps working. The tables below are presented to users, with only
// the listed columns, so new columns or tables never surface without a decision.
//
// Columns are checked against the generated spec, so a renamed or removed column fails the build.
import type { Columns, Table, WebhookEvent } from "./spec";

type Row = Record<string, any>;

export type SearchOperator = "eq" | "ilike";

export type TableConfig<T extends Table> = {
  // Completes "create a new ...", defaults to the singular table name
  noun?: string;
  // Shown in dropdowns, defaults to the first of name, title, label, reference, email and id
  label?: (row: Row) => unknown;
  // PostgREST select for rows returned to Zapier, e.g. to embed related rows
  select?: string;
  create?: { columns: Array<Columns[T]>; description: string };
  update?: { columns: Array<Columns[T]>; description: string };
  search?: {
    columns: { [C in Columns[T]]?: SearchOperator };
    description: string;
  };
};

export const tableConfigs: { [T in Table]?: TableConfig<T> } = {
  bookings: {
    label: (row) => row["reference"],
    search: {
      columns: { reference: "eq" },
      description: "Finds a booking by its reference.",
    },
  },
  calendar_event_notes: {
    label: (row) => row["note"],
    create: {
      columns: ["calendar_event_id", "note"],
      description: "Adds a private note to a calendar event.",
    },
  },
  calendar_events: {
    label: (row) => row["title"] || row["generated_title"],
    search: {
      columns: { booking_id: "eq", product_id: "eq", start_date: "eq" },
      description: "Finds a calendar event by its booking, unit or start date.",
    },
    update: {
      columns: ["status", "title", "notes", "start_date", "end_date"],
      description:
        "Updates a calendar event, for example to confirm or cancel it, or to change its dates.",
    },
  },
  contacts: {
    label: (row) => row["name"] || row["email"] || row["phone"],
    create: {
      columns: [
        "first_name",
        "last_name",
        "email",
        "phone",
        "language",
        "company_name",
        "street",
        "street2",
        "zip",
        "city",
        "province",
        "state",
        "country",
        "notes",
        "sms_opt_in",
      ],
      description: "Creates a new contact.",
    },
    search: {
      columns: { email: "eq", phone: "eq", name: "ilike" },
      description: "Finds a contact by email address, phone number or name.",
    },
    update: {
      columns: [
        "first_name",
        "last_name",
        "email",
        "phone",
        "language",
        "company_name",
        "street",
        "street2",
        "zip",
        "city",
        "province",
        "state",
        "country",
        "notes",
        "sms_opt_in",
      ],
      description: "Updates the details of a contact.",
    },
  },
  invoices: { label: (row) => row["reference"] },
  members: {
    label: (row) =>
      row["user_profile"]?.["name"] || row["user_profile"]?.["email"],
    select: "*,user_profile:user_profiles!inner(*)",
  },
  payments: {
    label: (row) => row["reference"],
    search: {
      columns: { reference: "eq", booking_id: "eq" },
      description: "Finds a payment by its reference or booking.",
    },
  },
  products: { noun: "Unit", label: (row) => row["name"]?.["default"] },
  sites: { label: (row) => row["subdomain"] },
  tasks: {
    label: (row) => row["label"],
    create: {
      columns: ["calendar_event_id", "label", "due_at", "schedule"],
      description: "Creates a task for a calendar event.",
    },
    update: {
      columns: ["label", "due_at", "schedule", "completed_at"],
      description:
        "Updates a task. Set the completion time to mark it as completed.",
    },
  },
  user_profiles: { label: (row) => row["name"] || row["email"] },
  widgets: { label: (row) => row["title"] },
};

// Webhook events beyond created and updated, and the rows that match them for sample data
export const eventFilters: {
  [E in WebhookEvent]?: { filter: Record<string, string>; order: string };
} = {
  "calendar_events.cancelled": {
    filter: { status: "eq.CANCELLED" },
    order: "updated_at.desc",
  },
  "calendar_events.confirmed": {
    filter: { status: "eq.CONFIRMED" },
    order: "updated_at.desc",
  },
  "payments.paid": {
    filter: { status: "eq.paid" },
    order: "completed_at.desc.nullslast",
  },
  "tasks.completed": {
    filter: { completed_at: "not.is.null" },
    order: "completed_at.desc",
  },
};
