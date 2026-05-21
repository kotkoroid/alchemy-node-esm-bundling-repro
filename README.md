# alchemy-node-esm-bundling-repro

Minimal reproduction for two bugs hit when using `bun alchemy dev` with a
workspace library imported transitively through `alchemy.run.ts`.

## Setup

```
bun install
bun dev
```

No Cloudflare credentials needed — both bugs crash before any API call.

> **Trigger:** having a `Cloudflare.Vite` resource alongside the Worker forces
> alchemy's dev subprocess onto the Node.js path (`node --experimental-transform-types`).
> Without `Cloudflare.Vite`, alchemy uses Bun and the errors don't appear.

## Bug 1 — Extension-less TypeScript imports break under alchemy's exec subprocess

`alchemy dev` eventually spawns `node --experimental-transform-types exec.js`
(not a Bun process). Node.js strict ESM requires explicit file extensions;
`from './helper'` fails even though `helper.ts` exists next to `index.ts`.

**Error:**
```
Error: Cannot find module '…/libs/shared/src/helper'
       imported from …/libs/shared/src/index.ts
    at finalizeResolution (node:internal/modules/esm/resolve:274:11)
```

**Fix:** use `from './helper.ts'` and add `allowImportingTsExtensions: true`
to the library's tsconfig.

## Bug 2 — JSON imports need `with { type: 'json' }` under Node.js 22

Same subprocess context as Bug 1. Node.js 22 enforces import attributes for
JSON modules; Bun and Vite do not require them.

**Error:**
```
TypeError: Module "…/libs/shared/src/data/config.json"
           needs an import attribute of "type: json"
```

**Fix:** `import config from './data/config.json' with { type: 'json' }`

## Root cause

`bun alchemy dev` goes through this chain:

1. `bun alchemy dev` — the `.bin/alchemy` launcher has `#!/usr/bin/env node`,
   so it runs under **Node.js**
2. The launcher detects `invokedByBun` via `npm_config_user_agent` and spawns
   `bun alchemy.ts dev`
3. `alchemy.ts` calls `dev()`, which checks `typeof globalThis.Bun` — but at
   this point the process is Bun, so it spawns:
   `bun run --watch exec.ts`
4. `exec.ts` calls `importStack`, which does
   `import(path.resolve(cwd, 'alchemy.run.ts'))` — Bun handles `.ts` fine
5. `alchemy.run.ts` → `Worker.ts` → `@repro/shared` — resolved to
   `libs/shared/src/index.ts` via package `exports`
6. **Node.js strict ESM** resolves the relative imports inside `index.ts` and
   fails on extension-less specifiers and bare JSON imports

The library code was authored for Bun/Vite and is never directly executed by
Node.js in normal use — only the alchemy evaluator chain hits this path.
