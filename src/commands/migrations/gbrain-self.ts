/**
 * Resolve the command prefix used to re-invoke the CURRENTLY-RUNNING gbrain
 * CLI from a migration. Must survive bun-link installs where
 * `process.execPath` is the bun interpreter (`/Users/…/.bun/bin/bun`), not
 * the gbrain entry script.
 *
 * Strategy: prefix `bun run <cli.ts>` where cli.ts comes from
 * `process.argv[1]`. This works in three install shapes:
 *
 *   - dev:        `bun run src/cli.ts apply-migrations`
 *                 → argv[1] = /…/src/cli.ts
 *   - bun link:   `gbrain apply-migrations` (symlink -> .../node_modules/gbrain/src/cli.ts)
 *                 → argv[1] = /…/node_modules/gbrain/src/cli.ts (bun resolves the symlink)
 *   - shebang:    `/usr/bin/env bun` at top of cli.ts with direct invocation
 *                 → argv[1] = /…/cli.ts
 *
 * We intentionally DO NOT fall back to a bare `gbrain` on $PATH: after
 * `gbrain upgrade` rewrites the binary, a stale PATH entry could resolve
 * to a different version. argv[1] is always the module that loaded this
 * migration code, so it's the right gbrain by definition.
 */

function shellQuote(s: string): string {
  // Safe single-quoting for POSIX sh. Replaces each ' with '\''.
  return `'${s.replace(/'/g, `'\\''`)}'`;
}

/**
 * Returns a shell-ready command prefix (already quoted) that re-invokes
 * this gbrain CLI. Append your subcommand + args as a plain string:
 *
 *   execSync(`${gbrainSelfCmd()} init --migrate-only`, {...});
 */
export function gbrainSelfCmd(): string {
  const bun = shellQuote(process.execPath);
  const cli = process.argv[1];
  if (!cli) {
    // Should never happen — bun always sets argv[1] to the entry script.
    // Fall back to the $PATH lookup so something still runs instead of
    // throwing from inside a migration.
    return 'gbrain';
  }
  return `${bun} run ${shellQuote(cli)}`;
}
