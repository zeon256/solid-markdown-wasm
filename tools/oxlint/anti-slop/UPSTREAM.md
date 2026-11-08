# anti-slop (vendored)

Source: [dmmulroy/anti-slop](https://github.com/dmmulroy/anti-slop), commit
`13909c9e07590f5a85d93c62712259fe14a883f7`, copied from
`skills/install-anti-slop/assets/anti-slop/` via `scripts/install.mjs`.

Installed paths:

- `tools/oxlint/anti-slop/index.ts` — plugin entry point, registered as
  `anti-slop` in `.oxlintrc.json`.
- `tools/oxlint/anti-slop/rules/`, `shared/`, `vendor/eslint-stylistic/`.

Dependencies: `oxlint` and `@oxlint/plugins` pinned to the same exact version.

## Local deviations

- Removed the opt-in `effect/` plugin. This repository does not depend on
  Effect.
