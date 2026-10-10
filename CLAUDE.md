# Project rules for AI agents

Read `AGENTS.md` (Next.js 16 differs from older versions) and `docs/TESTING.md` (which tests to run)
first. `GOTCHA.md` lists mistakes already made here; don't repeat them.

## Prefer reuse over new code

Before writing anything new, in this order:

1. **Does it need to exist?** If the request can be met by changing or deleting existing code, do that.
2. **Is it already here?** Search `src/lib/` and `src/components/` for a helper, type or component that
   does the job. Examples: `uuidPattern`, `isLocale`, `isOrganisationRole`, `getViewer`,
   `verificationReady`, `approvedOrganization`, `parsePlaceDraft`. Extend it rather than copy it.
3. **Does the platform cover it?** Prefer React/Next/Supabase/standard-library features over a new
   dependency. Pinned versions in `package.json` stay pinned; adding a dependency needs a stated reason.
4. **Only then write it**, as small as the task allows. No speculative options, abstractions or
   config for cases that don't exist yet.

When you duplicate logic that already exists in two places, say so rather than adding a third copy.

## What "less code" never cuts

- Input validation, `getUser()` / approval / role checks, and fail-closed behaviour on server paths.
- Accessibility: labels, focus handling, text alternatives, contrast, reduced motion. WCAG 2.2 AA is
  the target (`docs/ACCESSIBILITY.md`).
- All three languages (EN/RO/DE): every user-facing string goes through the copy dictionaries.
- Tests for behaviour you change. Keep unit tests in `tests/unit/` and e2e in `tests/*.spec.ts`.

## Style

- Match the surrounding file. Don't reformat code you aren't changing.
- New code: normal line breaks, one statement per line. Don't extend the dense one-line style that
  some older files use.
- The displayed brand is NERUMA; VIANORAE is the repository/infrastructure name (see README). Don't
  introduce a third name.

## Working rules

- Secrets live in a gitignored `.env`; never commit one or paste one into docs.
- Don't edit the generated block in `AGENTS.md`; add project rules here.
- Say plainly what you changed, what you ran, and what you did not run.
