// BUG 1: extension-less relative import
// Node.js strict ESM (used by alchemy's exec subprocess) cannot resolve
// './helper' without an explicit extension. Bun and Vite handle it fine.
//
// Error: Cannot find module '…/libs/shared/src/helper'
//        imported from …/libs/shared/src/index.ts
//
// Fix: change to './helper.ts'
export { MESSAGE } from './helper';

// BUG 2: JSON import without import attribute
// Node.js 22 requires `with { type: 'json' }` for JSON module imports.
// Bun and Vite do not require it.
//
// Error: TypeError: Module "…/libs/shared/src/data/config.json"
//        needs an import attribute of "type: json"
//
// Fix: add   with { type: 'json' }
import config from './data/config.json';
export { config };
