# Bookingmood <-> Zapier integration

To get started, simply run `yarn` to install the dependencies.

Find the latest zapier docs at: https://github.com/zapier/zapier-platform/blob/main/packages/cli/README.md.

## Development

```bash
yarn watch
# In other terminal
yarn test-watch
```

## Publishing

```bash
# Update version in package.json
yarn build && zapier push
# Test within zapier
zapier promote [new_version]
zapier migrate [old_version] [new_version]
```
