# Next MVP phase

The current delivery completes the local foundation. Build the next phase in this order:

1. **Separate GitHub and Vercel resources (completed for preview):** `euroschneider-spec/Vianorae` repository created by the project owner; dedicated Vercel project in `euroschneider-6376s-projects`; preview URL only. No custom domain, DNS, billing change or production use of an existing project.
2. **Separate Supabase project (schema installed):** the owner created `uzlngrzokjzxvdfpctnt` in a new account and installed the reviewed schema manually. All 24 public tables have RLS. The independent VIANORAE preview uses only its URL/ref/publishable key. Management API access remains unavailable; reconcile manual migration history and run live advisors when access is restored.
3. **Organisation authentication:** registration/sign-in, SSR sessions, confirmation callback and first-owner responsibility-aware onboarding are configured in preview. The owner saved exact callback redirects and confirmed real signup → email confirmation → organisation creation in the deployed app. Next verify a second tenant, expired links and sign-out/re-login, then add recovery, invite-based onboarding and last-owner handling. Public guides remain account-free.
4. **Database-backed Guide Builder:** create/edit places and 3–8 zones, media with alt text and rights, translations, sensory fields and ordered steps.
5. **Publish:** validated immutable snapshots in one transaction, draft/published separation, source/expiry rules, stable database QR registry and mobile preview.
6. **Pilot trust workflow:** assessor assignment, instruments, timestamps, evidence, independent review, protocol version, validity and re-assessment.
7. **Pilot readiness:** specialist methodological calibration, lived-experience feedback, native-language review, manual WCAG audit, screen-reader testing, legal/GDPR review, and 3–5 real partners.

Billing, email providers, analytics subscriptions, API keys, PDF export, certification claims and native mobile apps remain outside this foundation.
