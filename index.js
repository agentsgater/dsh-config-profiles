/**
 * Host half of the config-profiles bundle.
 *
 * The UI is the Client module (`client.js`); bundle inventory and mutations
 * come from the existing `pluginManager` Host service through its generated
 * `@Remote` entry points, so this half registers nothing of its own.
 */
export function apply() {}
