# Organisation accounts, photographs and responsibility · 7 October 2026

## Available in the preview

- `/en/register`, `/ro/register`, `/de/register`: dedicated organisation registration, linked from the header, footer, organisation page and sign-in. Categories include institutions, museums, hotels, cultural venues, public services and other organisations.
- `/[locale]/dashboard/builder`: one JPEG/PNG/WebP photograph per zone, image preview, required alternative text, rights/credit and photography date. Files are limited to 5 MB, checked for format and decoded as images. Raster re-encoding removes original EXIF/GPS metadata and limits dimensions to 1600 px. Binary images use browser IndexedDB; only references and descriptive metadata enter the saved draft.
- Public fictional guide data remains independent of local drafts. The editor and local preview can show uploaded photos. Removing a photo from the draft restores the illustration; browser site-data clearing removes retained local images.
- Organisation responsibility appears at registration, on the organisation and terms pages, in the editor and before publication. It covers supplied content, completeness, accuracy, currency, image rights and ongoing updates, with a concrete explanation of the impact on visitors. It is not a blanket legal release of the platform’s own obligations.
- A separate publication review requires the responsible representative, check date and explicit acknowledgements. The exact saved draft is recorded locally with statement version `2026-10-07-v1`. Editing invalidates the displayed review and requires checking the new version. This neither publishes nor certifies a guide.

## Real accounts: prepared but inactive

Supabase reported a monthly creation cost of 0. The owner selected the existing administrative organisation with a completely separate VIANORAE project. Creation was refused because the account already has two active free projects. No project was created, paused, deleted or upgraded, and no existing database or keys were reused.

Consequently registration and sign-in stay explicitly inactive. The form is disabled and does not collect or send credentials. It must not be represented as a functioning account service.

The code prepares Supabase SSR cookie sessions, email/password registration, PKCE email-confirmation callback, server-verified account access, sign-out and organisation onboarding. Editable user metadata only prefills profile suggestions; it never grants roles or tenant membership. The verified onboarding RPC atomically creates a new tenant with a fixed owner membership and a responsibility record for the authenticated user. Retries are idempotent. It accepts no caller-selected tenant, user ID, role, acceptance timestamp or statement version.

## Activation when separate free capacity is available

1. Provision a dedicated VIANORAE project; check actual cost again. Do not use any existing project as a fallback.
2. Apply and review all three migrations, run Supabase advisors and regenerate database types.
3. Set only this project's `VIANORAE_SUPABASE_PROJECT_REF`, `NEXT_PUBLIC_SUPABASE_URL`, and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in the VIANORAE preview. The guard requires matching project ref/URL and a publishable key. No service-role key is used.
4. Enable email confirmation; configure the app URL and allow only the exact VIANORAE callback/branch URLs for redirects. Configure an appropriate email provider and abuse controls before public signup; built-in email delivery has development limits.
5. Verify real signup → confirmation → sign-in → onboarding → tenant isolation → sign-out, including expired links and a second user. PGlite tests do not replace live Auth/SSR verification.
6. Connect live guide persistence and private photo storage with tenant-scoped policies, followed by server-enforced publication review. The current editor remains a clearly labelled browser demo even after account activation.

A Vercel preview branch remains separate from production. No custom domains, DNS, paid services or unrelated application settings are part of this change.
