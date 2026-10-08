# Gotchas

Mistakes made during AI-assisted work on this repo, so they don't repeat.

## 2026-10-08 — wrote a unit test for an unreachable branch

While adding the first Vitest unit tests (`tests/unit/reading-settings.test.ts`) for
`launcherTop()` in `src/components/reading-settings.tsx`, I wrote a test asserting the
"too close to the bottom edge" clamp branch. The formula is
`clamp(viewportHeight - buttonHeight - 24, 8, viewportHeight - buttonHeight - 8)` — the
natural (unclamped) value is always exactly 16px inside the upper bound, so that branch
can never actually trigger; only the "viewport too short" (lower bound) branch is
reachable. The test asserted a value that doesn't correspond to any real input and failed
for the wrong reason. Removed it instead of patching the assertion, since a corrected
version would have duplicated the existing "short viewport" test.

**Takeaway**: before asserting a clamp/range edge case, check whether the surrounding
formula can actually produce a value in that range — don't assume both bounds of a
`clamp()` are independently reachable.

## 2026-10-08 — new Vitest file broke full Playwright runs (glob collision)

Right after adding `tests/unit/reading-settings.test.ts`, a full `npx playwright test`
run (no file args) started failing with `Cannot find module '.../node_modules/next/navigation'
imported from .../reading-settings.tsx` — but only when all three `.spec.ts` files ran
together via directory discovery; any explicit subset, or any single file, passed. That
red herring cost real time: I first suspected a Next 16 dev/HMR cross-origin issue (real,
but separate — see below), then a stale reused server process, before realizing Playwright's
default `testMatch` pattern matches `*.test.ts` as well as `*.spec.ts`. Only a bare/full-dir
run discovers `tests/unit/*.test.ts`; explicit `.spec.ts` args never did, which is why the
failure looked file-combination-dependent instead of "my new file" dependent. Playwright
tried to load the unit test (and transitively `reading-settings.tsx`) through its own
Node/ESM loader, which can't resolve Next's `next/navigation` subpath export the way
Next's bundler does.

**Fix**: added `testIgnore:'**/unit/**'` to `playwright.config.ts` so Vitest (`tests/unit/`)
and Playwright (`tests/*.spec.ts`) never share discovery.

**Takeaway**: when two test runners share a `tests/` root, check both tools' default file
globs for overlap before assuming a new file is inert to the other runner.

## 2026-10-08 — ran Playwright against `npm run dev` instead of production

Separately, I initially checked the button fix by reusing the already-running `npm run dev`
server (`reuseExistingServer:true` happily reused it) instead of letting Playwright start
its configured `npm run start` (production) server. Next.js 16 blocks cross-origin dev
resources by default; the dev server was reachable at `127.0.0.1:3000` fine for plain page
loads, but its HMR websocket silently failed under that origin, client hydration never
completed, and every test interacting with the reading-settings button failed — with zero
relation to the actual code change. The project's own `playwright.config.ts` already encodes
the right behavior (`webServer.command:'npm run start'`); I just bypassed it by having a dev
server already up on the same port.

**Takeaway**: stop any `npm run dev` process (or just check `lsof -i:3000`) before running
`npm run test:e2e` — let Playwright own the server it's configured to use rather than silently
reusing whatever happens to already be listening on the port.
