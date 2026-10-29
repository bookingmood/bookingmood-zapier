# Bookingmood <-> Zapier integration

The integration is generated from the public [Bookingmood OpenAPI spec](https://api.bookingmood.com/v1/openapi.json), with a curated layer on top.

- `src/generated/` holds the spec and the types derived from it. Don't edit it by hand: run `pnpm sync-spec`.
- `src/config.ts` decides what users see: the tables with visible create, update and find actions, their columns, and their dropdown labels. Columns are typed against the spec, so a renamed or removed column fails the typecheck.
- Every table gets hidden list and create operations. They power the dropdowns and keep older Zaps working.
- There is a trigger for every webhook event in the spec. `src/actions.ts` covers the endpoints that aren't a single table, such as members and units.
- `surface.json` summarizes what users see in the Zap editor. Review its diff like a changelog.

## Development

```bash
pnpm install
pnpm test        # pnpm test -u updates surface.json after an intended change
pnpm typecheck
pnpm validate    # builds and runs Zapier's checks
```

The API keys in tests are fake: every request is mocked with nock.

## When the Bookingmood API changes

Every Monday, the _Sync API spec_ workflow opens a pull request when the spec changed. To sync by hand:

```bash
pnpm sync-spec
# Before the API change is deployed, sync from a local dev server:
BOOKINGMOOD_OPENAPI_URL=http://www.localhost:3000/api/v1/openapi.json pnpm sync-spec
```

Then fix type errors in `src/config.ts`, run `pnpm test -u`, and review `surface.json`. A new table or column only becomes visible once it's added to `src/config.ts`.

CI runs `pnpm check-spec`, which fails while `src/generated/` differs from the production spec.

In the main repository, changes to `apiAccessibleMethods`, `webhookEvents` or the custom `/v1` endpoints reach the spec automatically. Custom endpoints need an action in `src/actions.ts`.

## Releasing

1. Bump `version` in `package.json` and add a `CHANGELOG.md` entry.
2. Merge, then tag the release: `git tag v2.0.1 && git push --tags`. The _Release_ workflow tests the integration and pushes it to Zapier. It needs the `ZAPIER_DEPLOY_KEY` secret in the `zapier` environment. Create the key with `zapier-platform login`, or under Zapier's developer settings.
3. Test the new version in Zapier, then promote it and migrate existing users:

```bash
pnpm exec zapier-platform promote 2.0.1
pnpm exec zapier-platform migrate 2.0.0 2.0.1
```

Promotion emails users about the changelog, so it stays a manual step.

Keep trigger and action keys stable: Zaps refer to them, so a renamed key breaks every Zap that uses it. To retire an action, set `hidden: true` instead of removing it.

## Notes

- `pnpm-workspace.yaml` sets `nodeLinker: hoisted`, because the Zapier CLI can't package pnpm's symlinked `node_modules`.
- Zapier runs the integration on Node 22, so CI uses Node 22 too, and `@types/node` stays on 22.x.
- Update dependencies by hand: run `pnpm update --latest`, set `@types/node` back to the latest 22.x, then run `pnpm test` and `pnpm validate`. Zapier retires old `zapier-platform-*` versions, so update those at least every few months.
- Find the Zapier CLI docs at https://docs.zapier.com/platform/reference/cli.
