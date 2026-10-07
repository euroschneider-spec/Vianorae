# Next MVP phase

The current delivery includes real organisation onboarding and a private database-backed editor. Build the next phase in this order:

1. **Separate GitHub and Vercel resources (completed for preview):** `euroschneider-spec/Vianorae` repository created by the project owner; dedicated Vercel project in `euroschneider-6376s-projects`; preview URL only. No custom domain, DNS, billing change or production use of an existing project.
2. **Separate Supabase project (schema installed):** the owner created `uzlngrzokjzxvdfpctnt` in a new account and installed the reviewed schema manually. All 24 public tables have RLS. The independent VIANORAE preview uses only its URL/ref/publishable key. Management API access remains unavailable; reconcile manual migration history and run live advisors when access is restored.
3. **Organisation authentication:** registration/sign-in, SSR sessions, confirmation callback and first-owner responsibility-aware onboarding are configured in preview. The owner saved exact callback redirects and confirmed real signup → email confirmation → organisation creation in the deployed app. Local full-flow tests cover a second tenant and sign-out/re-login with simulated Auth. Verify those flows on the live service, plus expired links, then add recovery, invite-based onboarding and last-owner handling. Public guides remain account-free.
4. **Database-backed Guide Builder (implemented):** create/edit private places and 1–8 draft zones, private photos with alt text/rights/date, EN/RO/DE descriptions, sensory fields and ordered steps. Atomic saves use a revision check. The owner installed the additional migration and the API confirms schema version 1. Complete an owner-performed live save/upload/reload pilot; require 3–8 completed zones at publication.
5. **Publish (next implementation):** explicit representative responsibility review, validated immutable snapshots in one transaction, draft/published separation, source/expiry rules, stable database QR registry and mobile preview.
6. **Pilot trust workflow:** assessor assignment, instruments, timestamps, evidence, independent review, protocol version, validity and re-assessment.
7. **Pilot readiness:** specialist methodological calibration, lived-experience feedback, native-language review, manual WCAG audit, screen-reader testing, legal/GDPR review, and 3–5 real partners.

Billing, email providers, analytics subscriptions, API keys, PDF export, certification claims and native mobile apps remain outside this foundation.
