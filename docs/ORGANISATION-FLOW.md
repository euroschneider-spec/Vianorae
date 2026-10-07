# Organisation accounts, photographs and responsibility · 7 October 2026

## Available in the preview

- `/en/register`, `/ro/register`, `/de/register`: dedicated organisation registration, linked from the header, footer, organisation page and sign-in. Categories include institutions, museums, hotels, cultural venues, public services and other organisations.
- `/[locale]/dashboard/builder`: one JPEG/PNG/WebP photograph per zone, image preview, required alternative text, rights/credit and photography date. Files are limited to 5 MB, checked for format and decoded as images. Raster re-encoding removes original EXIF/GPS metadata and limits dimensions to 1600 px. Binary images use browser IndexedDB; only references and descriptive metadata enter the saved draft.
- Public fictional guide data remains independent of local drafts. The editor and local preview can show uploaded photos. Removing a photo from the draft restores the illustration; browser site-data clearing removes retained local images.
- Organisation responsibility appears at registration, on the organisation and terms pages, in the editor and before publication. It covers supplied content, completeness, accuracy, currency, image rights and ongoing updates, with a concrete explanation of the impact on visitors. It is not a blanket legal release of the platform’s own obligations.
- A separate publication review requires the responsible representative, check date and explicit acknowledgements. The exact saved draft is recorded locally with statement version `2026-10-07-v1`. Editing invalidates the displayed review and requires checking the new version. This neither publishes nor certifies a guide.

## Real accounts: dedicated preview configuration

The owner created the dedicated Supabase project `uzlngrzokjzxvdfpctnt` in a new account. Its SQL Editor result confirms installation of the three-migration schema: 24 public tables, all with RLS enabled. The manual installer refuses an existing application schema and runs atomically; it does not record Supabase CLI migration history. Reconcile migration history against the reviewed source before any future CLI migration push; do not reapply the foundation.

Only the VIANORAE Vercel preview branch `foundation-v0.1` has the matching project ref, API URL and project-specific publishable key configured. The API accepts the public key, requires email confirmation, disables anonymous Auth, and refuses anonymous reads of organisation/user/acknowledgement data and anonymous onboarding. No service-role key or credentials from other applications are used.

The configured preview deployment is READY. Registration/sign-in controls are enabled. After saving the exact preview callback URLs and Site URL, the owner confirmed successful real signup, email confirmation and organisation creation through the deployed app. This is owner-performed live verification; automated protected-preview access and hosted multi-tenant integration tests remain pending; isolated full-flow tests exercise two organisations through the application with simulated Auth/Storage HTTP. Management API access still refuses this new project. Built-in Supabase email delivery is for development and restricts recipients/rate; configure an appropriate provider and abuse controls before inviting public users.

The code prepares Supabase SSR cookie sessions, email/password registration, PKCE email-confirmation callback, server-verified account access, sign-out and organisation onboarding. Editable user metadata only prefills profile suggestions; it never grants roles or tenant membership. The verified onboarding RPC atomically creates a new tenant with a fixed owner membership and a responsibility record for the authenticated user. Retries are idempotent. It accepts no caller-selected tenant, user ID, role, acceptance timestamp or statement version.

## Remaining activation and integration checks

1. Dedicated project provisioned by the owner: `uzlngrzokjzxvdfpctnt`. Never use another project as a fallback.
2. Schema installed manually; run Supabase advisors and regenerate database types when management access is available. Reconcile migration history before future CLI pushes.
3. Set only this project's `VIANORAE_SUPABASE_PROJECT_REF`, `NEXT_PUBLIC_SUPABASE_URL`, and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in the VIANORAE preview. The guard requires matching project ref/URL and a publishable key. No service-role key is used.
4. Enable email confirmation; configure the app URL and allow only the exact VIANORAE callback/branch URLs for redirects. Configure an appropriate email provider and abuse controls before public signup; built-in email delivery has development limits.
5. Owner-performed signup → confirmation → account → organisation creation passed. Still verify sign-out/re-login, expired links and a second user/tenant. PGlite tests do not replace authenticated multi-tenant integration checks.
6. Private guide persistence and photo storage are implemented at `/[locale]/workspace`, behind the dedicated configuration and workspace flag. The additional migration is installed and the API reports schema version 1. Perform an owner-operated live save/upload/reload check, then implement server-enforced publication review. The `/dashboard` editor remains a separate browser demo.

A Vercel preview branch remains separate from production. No custom domains, DNS, paid services or unrelated application settings are part of this change.

## Online editor

The account page links directly to the private organisation workspace. Owners/admins/editors can create locations, save 1–8 draft steps with all six sensory channels, reorder or remove steps, upload private photos and preview the persisted version. Images require localized alternative text, rights/credit and a valid photography date. Input is checked by the browser, server action and atomic database RPC. The photo API independently decodes/re-encodes images to prevent clients bypassing metadata stripping.

Save the initial location/zone before uploading. Upload creates a private file; a subsequent successful draft save attaches it. Detaching/replacing retains the processed private file. A failed or stale save does not claim publication or silently overwrite another revision. Publishing, QR registry activation and server-recorded publication responsibility review remain the next implementation.
