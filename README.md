# VIANORAE platform · foundation v0.1

A separate Next.js + TypeScript foundation based on `VIANORAE_plan_platforma_v0.1.pdf` (6 October 2026). Public pre-visit and sensory guides help visitors make their own decisions. VIANORAE does not certify venues, assign an overall accessibility score, or ask visitors for a diagnosis.

## Run locally

Use Node.js 24 (minimum 22), then:

```sh
npm ci
npm run dev
```

Open `http://localhost:3000/en`. No `.env` file, database or account is required for the demonstration.

```sh
npm run check
npx playwright install chromium
npm run test:e2e
npm run test:workspace
npm run start
```

`check` runs TypeScript, ESLint, isolated PostgreSQL security checks and the production build. Browser tests run against the production server, starting it if needed. `test:workspace` builds with explicit fake-project settings and runs two fictitious organisations against the real migrations in PGlite; Auth and Storage HTTP are simulated on loopback. It never contacts a live Supabase project. Run the anonymous demo tests before the workspace tests, because each uses a different build configuration.

## Included

- EN/RO/DE URLs with translated public content, explicit language choice and correct document language.
- Home, How it works, For organisations, Methodology, Example guide, Explore, Contact, Sign-in and organisation registration, Privacy, Terms and Accessibility draft pages.
- Fictional Willow Museum with five illustrated visit zones, six sensory bands, factual predictability information, source label, step navigation, skipping and completion.
- Demo workspace: overview, locations, local Guide Builder, preview, QR/share, role descriptions and settings.
- Versioned, validated browser-local drafts, separated by language. Public demo data remains fixed.
- Stable `/q/willow-museum` redirect and QR SVG at `/api/qr/willow-museum`.
- Reading preferences: text size, light/dark/high contrast, text spacing, reset and reduced-motion support.
- Four Supabase migrations, 24 RLS-protected public tables, relational tenant constraints, immutable guide snapshots, audit records and pilot provenance structures.
- Fictional local SQL seed, schema/domain types, automated checks and GitHub Actions workflow.
- Local zone photograph selection, binary storage in IndexedDB, alternative text, rights and photography dates.
- Organisation responsibility at registration, in the editor and in a deliberate pre-publication review.
- Authenticated online workspace with atomic database saves, revision conflicts, per-language steps and descriptions, private server photo storage, and saved-draft previews.
- Supabase SSR account integration configured in the independent preview, with owner-confirmed signup, email confirmation and organisation creation. Missing dedicated configuration still disables account forms.

## Demonstration boundaries

This is the **foundation and start of the MVP**. Real organisation registration and first-owner onboarding are configured in the dedicated preview and were tested by the owner. The account links to a database-backed Guide Builder at `/[locale]/workspace`; the public demonstration editor remains browser-local. Invitations, live publishing, assessor workflows, billing and PDF export remain to implement. The new-account Supabase project is `uzlngrzokjzxvdfpctnt`; no other database or keys are reused. Built-in email works for development recipients; a production email provider is still required before public invitations. Demo photographs stay in browser IndexedDB. The Contact form prepares an enquiry to copy; it does not send messages. Without dedicated Supabase configuration, registration/sign-in remain explicitly disabled.

The illustrations are original example assets, not photographs or evidence of a real venue. Every Museum description is fictional. Translations and legal/accessibility statements are development drafts requiring professional and user review before a real pilot.

## Project isolation

Work is confined to the dedicated VIANORAE directory, repository, Vercel preview and Supabase project. No unrelated application, database, secrets, custom domain or DNS was changed. No paid service was provisioned. The owner installed the reviewed schema in the new dedicated Supabase database.

The confirmed destination is `euroschneider-spec/Vianorae`. Its initial README commit is preserved in the local history. The owner confirmed this repository’s separate Vercel project. It has been renamed to `vianorae-platform` (`prj_wxGgoaJGSuHR7ko74qEDGuJWMFzy`) to remove the unrelated brand reference. Only its `foundation-v0.1` preview has the dedicated Supabase URL/ref/publishable key and online-workspace flag configured. Branch `foundation-v0.1` contains the foundation for preview review; remote `main` remains the owner’s initial commit until review. No application, database or secrets are shared with other projects.

Read [the organisation-flow update](docs/ORGANISATION-FLOW.md), [the handoff](docs/HANDOFF.ro.md), [architecture](docs/ARCHITECTURE.md), [database security](docs/DATABASE.md), [verification](docs/VERIFICATION.md), and [next MVP phase](docs/NEXT-STEPS.md).
