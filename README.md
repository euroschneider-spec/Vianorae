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
npm run start
```

`check` runs TypeScript, ESLint, isolated PostgreSQL security checks and the production build. Browser tests run against the production server, starting it if needed.

## Included

- EN/RO/DE URLs with translated public content, explicit language choice and correct document language.
- Home, How it works, For organisations, Methodology, Example guide, Explore, Contact, Login introduction, Privacy, Terms and Accessibility draft pages.
- Fictional Willow Museum with five illustrated visit zones, six sensory bands, factual predictability information, source label, step navigation, skipping and completion.
- Demo workspace: overview, locations, local Guide Builder, preview, QR/share, role descriptions and settings.
- Versioned, validated browser-local drafts, separated by language. Public demo data remains fixed.
- Stable `/q/willow-museum` redirect and QR SVG at `/api/qr/willow-museum`.
- Reading preferences: text size, light/dark/high contrast, text spacing, reset and reduced-motion support.
- Two Supabase migrations, 23 RLS-protected public tables, relational tenant constraints, immutable guide snapshots, audit records and pilot provenance structures.
- Fictional local SQL seed, schema/domain types, automated checks and GitHub Actions workflow.

## Demonstration boundaries

This is the **foundation and start of the MVP**, not the complete live platform. Real organisation accounts, database-backed persistence, image upload, invitations, live publishing, assessor workflows, billing, email delivery and PDF exports are not enabled. The Contact form prepares an enquiry to copy; it does not send messages. Login explains the current account status and links to the demo.

The illustrations are original example assets, not photographs or evidence of a real venue. Every Museum description is fictional. Translations and legal/accessibility statements are development drafts requiring professional and user review before a real pilot.

## Project isolation

Work was created solely in this new directory. No existing repository, deployment, database, secrets, domains or DNS were changed. No paid service was provisioned. No live Supabase database was created or linked.

The confirmed destination is `euroschneider-spec/Vianorae`. Its initial README commit is preserved in the local history. The owner confirmed this repository’s separate Vercel project. It has been renamed to `vianorae-platform` (`prj_wxGgoaJGSuHR7ko74qEDGuJWMFzy`) to remove the unrelated brand reference. Its configured environment variable list is empty. Branch `foundation-v0.1` contains the foundation for preview review; remote `main` remains the owner’s initial commit until review. No application, database or secrets are shared with other projects.

Read [the handoff](docs/HANDOFF.ro.md), [architecture](docs/ARCHITECTURE.md), [database security](docs/DATABASE.md), [verification](docs/VERIFICATION.md), and [next MVP phase](docs/NEXT-STEPS.md).
