# Verification · 7 October 2026

## Verified flows

Public EN/RO/DE pages, the fictional account-free Museum guide, QR navigation, reading preferences and browser-local demonstration editing remain covered by 29 Playwright scenarios. Real signup, email confirmation and first-owner organisation creation in the dedicated Vercel/Supabase preview were confirmed separately by the project owner.

The online workspace is tested through the production Next.js server with two fictitious verified owners and separate organisations. The application uses its actual SSR cookies, server actions, image API and all four database migrations. An isolated PGlite PostgreSQL database enforces real RLS and constraints. Test-only Auth and Storage HTTP fixtures run on loopback; no real accounts, emails, files or application rows are created remotely. These are full local application-flow checks, not hosted Supabase service tests.

## Checks

| Check | Result |
| --- | --- |
| Strict TypeScript | PASS |
| ESLint / React checks | PASS |
| Next.js production build | PASS with missing configuration and with explicit workspace fixture configuration |
| Deployment packaging | PASS; all runtime source/assets and build inputs retained, root tooling excluded |
| Database checks | PASS; 42 SQL security, consent, atomic save, conflict, translation and Storage-policy scenarios |
| Existing browser regression scenarios | PASS; 29 Playwright scenarios |
| Online workspace flow | PASS; all 19 scenarios |
| Production dependency audit | PASS; 0 reported vulnerabilities |

The online checks cover unauthenticated redirects/API denial; real app sign-in against simulated Auth; initial save before upload; persistent location/sensory values; PNG-to-private-WebP upload; server resizing and removal of original metadata; saved preview; access in a separate browser session; stale revision refusal with unsaved text retained; cancellable unsaved navigation; cross-tenant place/preview/photo denial; malformed image rejection; step reorder/removal; independent Romanian text/photo alt; EN/RO/DE WCAG A/AA axe checks; 320px reflow with 200% text; photo detachment retaining its private file; and sign-out revoking app access.

An early full-flow check exposed select labels containing option text; the new editor now uses explicit label/control associations. Another exposed translation initialization including retained removed zones; new languages now start from an existing guide's active steps. Both fixes are included in regression coverage.

Existing browser checks also cover corrupt browser data, locale separation, public/draft separation, local photo format/size rejection and IndexedDB persistence, saved-version responsibility review, enabled/disabled account configuration, mobile navigation, dark/high contrast, reading settings and contact preparation without outbound messages. Automated axe rules do not establish complete WCAG conformance.

## Live evidence and limits

- The new-account Supabase project is `uzlngrzokjzxvdfpctnt`. The owner installed the foundation (24 public tables, all RLS) and additional online-builder migration. A read-only API probe confirms `workspace_schema_version = 1` with HTTP 200. Do not repeat the initial installer; reconcile manual migration history before a CLI push.
- The dedicated public key is accepted by Auth; email confirmation is required and anonymous Auth is disabled. Anonymous internal reads and onboarding are denied. Those API probes are read-only and created no rows/accounts.
- The owner confirmed real signup → email confirmation → account → organisation creation in the deployed preview. A live owner-operated save/photo/reload pilot is still required for the new builder. Local fixtures cannot establish actual hosted Storage/API behaviour or email delivery.
- Vercel preview protection previously denied automated fetch access (403); protection is retained. No automated live browser walkthrough is claimed.
- No production SMTP provider, invitation flow, account recovery flow, public guide publishing, live QR registry or billing is enabled. Built-in email delivery remains suitable for authorized development recipients only.
- Supabase management access still refuses the new project. Live advisors and schema-generated type refresh remain pending; the application uses no service-role key.
- Manual screen-reader testing, user testing, professional language/legal review and methodological calibration remain for pilot readiness.

## Reproduce

```sh
npm ci
npm run check
npx playwright install chromium
npm run test:e2e
npm run test:workspace
```

Run the demo checks first: the workspace command deliberately builds with fictitious configuration and shuts down its owned fixture/server after testing. CI runs both suites. Test fixture scripts are excluded from Vercel deployments and never imported by application code.

## Evidence

`home-preview.png`, `mobile-preview.png`, `guide-preview.png`, `workspace-preview.png`, `builder-photo-preview.png` and `registration-preview.png` cover the public/local foundation. `online-builder-preview.png` shows the authenticated editor with entirely fictitious local-fixture data.

## Packaging regression

An earlier Vercel failure was caused by an unanchored `supabase` exclusion removing nested `src/lib/supabase` modules. Root-only exclusions and `npm run check:deployment` now protect application files from that regression.
