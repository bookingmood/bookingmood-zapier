const words = (value: string) =>
  value
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .split(/[^A-Za-z\d]+/)
    .filter(Boolean);

const capitalize = (word: string) =>
  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();

// "calendar_events.created" -> "calendarEventsCreated"
export const camelCase = (value: string) =>
  words(value)
    .map((word, i) => (i === 0 ? word.toLowerCase() : capitalize(word)))
    .join("");

// "calendar_events" -> "Calendar events"
export const sentenceCase = (value: string) =>
  words(value)
    .map((word, i) => (i === 0 ? capitalize(word) : word.toLowerCase()))
    .join(" ");

// "calendar_events" -> "Calendar Events"
export const titleCase = (value: string) =>
  words(value).map(capitalize).join(" ");

// "capacities" -> "capacity", "taxes" -> "tax", "calendar_events" -> "calendar_event"
export const singular = (value: string) =>
  value
    .replace(/ies$/, "y")
    .replace(/(ss|x|ch|sh)es$/, "$1")
    .replace(/([^s])s$/, "$1");
