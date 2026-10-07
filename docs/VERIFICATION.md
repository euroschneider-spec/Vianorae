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

- No live Supabase project or real auth account exists; SQL tests use PGlite and a test-only auth schema. Run full Supabase integration tests and advisors before a live connection.
- The confirmed repository is `euroschneider-spec/Vianorae`, with initial README commit `f99fa8d9cf2ddec9d368ea2710a7031156b2f524` preserved. The owner authorized its separate Vercel project, renamed to `vianorae-platform` (`prj_wxGgoaJGSuHR7ko74qEDGuJWMFzy`). Its environment variable list is empty. The source branch is `foundation-v0.1`; live preview verification follows deployment.
- No server media storage, email delivery, account invitation, paid subscription or live publish workflow is enabled. Image upload is real browser-local file selection/processing/storage only.
- A dedicated Supabase project was requested in the owner-selected administrative organisation after cost lookup returned 0 monthly; creation was refused by the two-active-free-project limit. No existing project was paused, deleted, upgraded or reused. Real account creation remains inactive. The full Auth/SSR flow still needs testing against a dedicated live project.
- Manual screen-reader testing, professional translation/legal review, real-user testing and methodological calibration remain for pilot readiness.
- Initial browser checks found and led to fixes for loading-state edits, ambiguous select names, mobile decorative overflow, enlarged-text reflow and dark-mode contrast.
