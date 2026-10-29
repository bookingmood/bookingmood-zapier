// surface.json is what users see in the Zap editor. Review its diff like a changelog,
// and update it with `pnpm test -u` when the change is intended.
import { createRequire } from "node:module";
import { describe, expect, test } from "vitest";

import { app } from "./helpers";

type Operation = {
  display: { label: string; description: string; hidden?: boolean };
  operation: { inputFields?: Array<Record<string, unknown>> };
};

// Compiling turns resources into the triggers, creates and searches Zapier shows
const { compileApp } = createRequire(`${process.cwd()}/`)(
  "zapier-platform-core/src/tools/schema",
);
const compiled = compileApp(app) as {
  creates: Record<string, Operation>;
  searches: Record<string, Operation>;
  triggers: Record<string, Operation>;
};

const summary = (operations: Record<string, Operation>) =>
  Object.fromEntries(
    Object.entries(operations)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, { display, operation }]) => [
        key,
        display.hidden
          ? "hidden"
          : {
              label: display.label,
              description: display.description,
              inputFields: (operation.inputFields ?? []).map((field) =>
                [
                  field["key"],
                  field["type"],
                  field["required"] ? "required" : undefined,
                  field["list"] ? "list" : undefined,
                  field["dynamic"] ? `dynamic:${field["dynamic"]}` : undefined,
                  Array.isArray(field["choices"])
                    ? `${field["choices"].length} choices`
                    : undefined,
                ]
                  .filter(Boolean)
                  .join(" "),
              ),
            },
      ]),
  );

describe("surface", () => {
  test("matches the reviewed surface", async () => {
    const surface = {
      authentication: app.authentication?.fields?.map((field) => field.key),
      triggers: summary(compiled.triggers),
      creates: summary(compiled.creates),
      searches: summary(compiled.searches),
    };
    await expect(`${JSON.stringify(surface, null, 2)}\n`).toMatchFileSnapshot(
      "../surface.json",
    );
  });

  test("dropdowns refer to existing list triggers", () => {
    const operations = [
      compiled.creates,
      compiled.searches,
      compiled.triggers,
    ].flatMap(Object.values);
    for (const { operation } of operations)
      for (const field of operation.inputFields ?? [])
        if (typeof field["dynamic"] === "string")
          expect(Object.keys(compiled.triggers)).toContain(
            field["dynamic"].split(".")[0],
          );
  });
});
