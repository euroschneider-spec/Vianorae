# CLI notes

Supabase CLI 2.120.0 could not initialise its global configuration in the managed read-only home. The official 2.81.3 Go release successfully created the project configuration and migration files without a login or live project link.

Two migration commands initially ran within one second and generated the same timestamp. The empty second placeholder was retained as this note, and a new migration command generated the later pilot filename. The database checks verify unique migration timestamps.

Next.js 16.4.0 uses the TypeScript CLI checker by default. Its captured `--showConfig` subprocess returned an empty result in this environment. The documented `experimental.useTypeScriptCli: false` setting selects the compiler API and preserves build-time type checking. Independent `tsc --noEmit` also passes.

The Playwright dependency override aligns the test runner and axe integration on one pinned browser/API version.
