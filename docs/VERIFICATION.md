# Foundation verification · 7 October 2026

## Scope

The verified story is: a visitor opens a localized public page, explores a fictional Museum guide without an account, navigates or skips visit steps, and follows a stable QR route. An organisation user can edit a demonstration draft, save it locally and preview it, while the public example remains unchanged.

The database story is: isolated PostgreSQL executes all three migrations; client roles can read/write only permitted tenant data; public readers see only a current published snapshot; trusted provenance and immutable history cannot be forged through normal client writes.

## Checks

| Check | Result |
| --- | --- |
| Strict TypeScript | PASS (`npm run typecheck`) |
| ESLint / React checks | PASS (`npm run lint`) |
| Next.js production build | PASS; 67 static entries plus server-rendered account/callback routes and Node.js QR/redirect handlers |
| Isolated database checks | PASS; 28 allow/deny, constraint, snapshot, consent-aware onboarding and seed scenarios |
| Production dependency audit | PASS; 0 reported vulnerabilities (`npm audit --omit=dev`) |
| Browser scenarios | PASS; all 29 Playwright scenarios, 49.7 seconds |

Additional browser coverage verifies local image format/size rejection, IndexedDB image persistence and alternative text, public/draft and language separation, explicit saved-version publication review, invalidation after edits, discoverable disabled registration without configuration, and callback redirect handling.

Browser coverage includes EN/RO/DE routes and document language, guide focus/navigation/completion, local draft persistence, corrupt-storage fallback, public/draft separation, locale separation, catalog filtering, QR SVG/download/redirect/error handling, route-preserving language switch, contact preparation without POST, reading preference persistence, dark/high-contrast checks, mobile navigation and 320px reflow with 200% base text plus spacing.

Automated axe checks cover WCAG A/AA tags on Home, Example guide, Contact, Guide Builder and the RO/DE homepages, plus EN/RO/DE registration, sign-in and dark/high-contrast homepage states. They do not establish complete WCAG conformance.

## Evidence

- `home-preview.png`: desktop landing.
- `mobile-preview.png`: mobile landing.
- `guide-preview.png`: public Museum guide.
- `workspace-preview.png`: demo workspace.
- `builder-photo-preview.png`: mobile local image editor with image metadata.
- `registration-preview.png`: organisation registration and responsibility copy.

## Limits

- Dedicated Supabase project `uzlngrzokjzxvdfpctnt` now exists. The owner-installed schema reports 24 RLS-protected public tables. The owner confirmed real account and organisation creation in preview. Authenticated multi-tenant integration tests and live advisors remain pending; isolated SQL tests do not replace them.
- The confirmed repository is `euroschneider-spec/Vianorae`, with initial README commit `f99fa8d9cf2ddec9d368ea2710a7031156b2f524` preserved. The owner authorized its separate Vercel project, renamed to `vianorae-platform` (`prj_wxGgoaJGSuHR7ko74qEDGuJWMFzy`). Only `foundation-v0.1` preview has dedicated Supabase configuration. Deployment `dpl_GhKrNsH8n83FGochrca8Ms2UGDS1` is READY. Vercel protection denied automated fetch access (403); no automated live browser walkthrough is claimed.
- No server media storage, production SMTP provider, account invitation, paid subscription or live publish workflow is enabled. Image upload is real browser-local file selection/processing/storage only.
- The earlier free-project limit was resolved by the owner creating a new account/project. No existing project was paused, deleted, upgraded or reused. The owner saved Supabase URL Configuration and confirmed the signup/email/account/organisation flow in the deployed app; additional session and multi-tenant tests remain.
- Manual screen-reader testing, professional translation/legal review, real-user testing and methodological calibration remain for pilot readiness.
- Initial browser checks found and led to fixes for loading-state edits, ambiguous select names, mobile decorative overflow, enlarged-text reflow and dark-mode contrast.

## Deployment packaging regression

The supplied Vercel log showed that an unanchored `supabase` exclusion removed `src/lib/supabase/config.ts` and `server.ts` before the build. Root-only exclusion rules now retain application code. `npm run check:deployment`, included in the standard check/CI command, validates every runtime source/public asset and build input against `.vercelignore`, while keeping root migrations, tooling and documentation excluded. Local/GitHub builds alone had not exercised this filtering step.

## Dedicated project activation checks

- The project-specific publishable key is accepted by Auth (HTTP 200). Email/password is enabled, email confirmation is required, and anonymous Auth is disabled.
- Anonymous public reads of templates/guides/versions/QR return HTTP 200. Internal organisation/membership/user/acknowledgement reads return HTTP 401. Anonymous `create_organisation` returns HTTP 401 / PostgreSQL 42501. These automated API probes created no accounts or application rows.
- A production build using the dedicated configuration passes. Local browser checks cover enabled EN/RO/DE registration, required consent fields, WCAG A/AA axe rules, and redirects from anonymous account access to sign-in. A missing confirmation code also safely redirects to sign-in on the local canonical host (`localhost`; Next normalizes loopback callback URLs). This is a local configured build, not an automated live Vercel browser test.
- After saving URL settings, the owner confirmed signup, email confirmation and successful organisation creation in the deployed preview. This is manual owner verification, not an automated live browser test. Authenticated tenant isolation with a second organisation, expired links and sign-out/re-login remain unverified.
