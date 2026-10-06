# Foundation verification · 6 October 2026

## Scope

The verified story is: a visitor opens a localized public page, explores a fictional Museum guide without an account, navigates or skips visit steps, and follows a stable QR route. An organisation user can edit a demonstration draft, save it locally and preview it, while the public example remains unchanged.

The database story is: isolated PostgreSQL executes both migrations; client roles can read/write only permitted tenant data; public readers see only a current published snapshot; trusted provenance and immutable history cannot be forged through normal client writes.

## Checks

| Check | Result |
| --- | --- |
| Strict TypeScript | PASS (`npm run typecheck`) |
| ESLint / React checks | PASS (`npm run lint`) |
| Next.js production build | PASS; 60 static entries and Node.js QR/redirect handlers |
| Isolated database checks | PASS; 21 allow/deny, constraint, snapshot and seed scenarios |
| Production dependency audit | PASS; 0 reported vulnerabilities (`npm audit --omit=dev`) |
| Browser scenarios | PASS; all 20 Playwright scenarios, 36.1 seconds |

Browser coverage includes EN/RO/DE routes and document language, guide focus/navigation/completion, local draft persistence, corrupt-storage fallback, public/draft separation, locale separation, catalog filtering, QR SVG/download/redirect/error handling, route-preserving language switch, contact preparation without POST, reading preference persistence, dark/high-contrast checks, mobile navigation and 320px reflow with 200% base text plus spacing.

Automated axe checks cover WCAG A/AA tags on Home, Example guide, Contact, Guide Builder and the RO/DE homepages, plus dark/high-contrast homepage states. They do not establish complete WCAG conformance.

## Evidence

- `home-preview.png`: desktop landing.
- `mobile-preview.png`: mobile landing.
- `guide-preview.png`: public Museum guide.
- `workspace-preview.png`: demo workspace.

## Limits

- No live Supabase project or real auth account exists; SQL tests use PGlite and a test-only auth schema. Run full Supabase integration tests and advisors before a live connection.
- The confirmed repository is `euroschneider-spec/Vianorae`, with initial README commit `f99fa8d9cf2ddec9d368ea2710a7031156b2f524` preserved. The owner authorized its separate Vercel project, renamed to `vianorae-platform` (`prj_wxGgoaJGSuHR7ko74qEDGuJWMFzy`). Its environment variable list is empty. The source branch is `foundation-v0.1`; live preview verification follows deployment.
- No real media upload, email delivery, account invitation, paid subscription or live publish workflow is enabled.
- Manual screen-reader testing, professional translation/legal review, real-user testing and methodological calibration remain for pilot readiness.
- Initial browser checks found and led to fixes for loading-state edits, ambiguous select names, mobile decorative overflow, enlarged-text reflow and dark-mode contrast.
