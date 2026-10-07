# Database foundation and safety boundaries

The CLI created both migration filenames. Supabase CLI 2.81.3 was used after the newer CLI could not initialise its global config in the managed read-only home. PostgreSQL 17 is configured for future local Supabase use. **No Supabase project is linked.**

`npm run test:db` executes all three migrations in an isolated PGlite PostgreSQL instance with test-only `auth.users`, `auth.uid()`, anon/authenticated/service roles and initially permissive default privileges. It tests real SQL grants, constraints and RLS; it does not substitute for a full Supabase integration test.

## Tables

Foundation: users, organizations, organization_members, templates, places, place_translations, zones, zone_translations, media_assets, sensory_profiles, guides, guide_steps, guide_versions, qr_redirects, audit_log.

Pilot structures: assessors, assessments, assessment_assignments, measurements, time_profiles, relief_features, reviews, external_certifications.

Subscriptions and API keys are deferred until their commercial/integration phase. No billing resources are provisioned.

## Access model

| Actor | Read | Write |
| --- | --- | --- |
| Public visitor | Published templates, published guide metadata, current snapshot, published QR routes | None |
| Owner | Own organisation and content, audit records | Own members, organisation, drafts, snapshots and publication pointer |
| Admin | Own organisation and content, audit records | Drafts, snapshots and publication pointer; no role administration |
| Editor | Own organisation and mutable content | Draft content; no publication, membership, verified label or snapshot changes |
| Assessor/reviewer | Own assignment and related pilot records | Closed pending trusted live workflow |
| Outsider with an account | Public published content | None |
| Trusted server / platform admin | Controlled server operations | Onboarding and pilot workflows, after server authorization is implemented |

Every public table enables RLS and explicitly revokes inherited client privileges before granting the required operations. Client roles receive no delete grants. UPDATE policies include USING and WITH CHECK. Tenant reassignment is additionally blocked by a trigger, including for users belonging to two organisations.

Internal membership and assignment lookups are SECURITY DEFINER functions in the non-exposed `private` schema. They have an empty search path, check `auth.uid()`, accept no caller-supplied user identity, and revoke PUBLIC execute access. Their purpose is scoped internal lookup without recursive RLS. Audit writes use a private trigger function; clients cannot forge audit records. Auth metadata is never trusted for roles.

Immutable guide versions permit INSERT by owners/admins, but no client UPDATE or DELETE. The guide's current-version foreign key ties publication to an existing snapshot. Public policies read only that current published version. The editable sensory profile and snapshot are constrained to `venue_provided`; independent claims cannot be invented through normal client writes. Separate assessment tables retain future verified provenance. Publication should become one server-controlled transaction with full content validation before live use.

The private `platform_admins` table has no client policies or direct client grants. Assignments and assessor training must be created by a trusted server. Pilot tables are read-only for clients, so this foundation does not accidentally expose an unimplemented approval workflow.

## Fictional seed

`supabase/seed.sql` creates one explicitly fictional, draft Museum with five zones and EN/RO/DE translations. It contains no auth accounts, passwords or memberships and publishes no guide. It is generated from the same typed demonstration data by `node scripts/create-demo-seed.mjs`. It is intended for a disposable local database or the future dedicated project only.

## Before connecting a new live database

1. Create the dedicated project under the intended owner and select an EU region where feasible. Do not select an existing database.
2. Apply and test migrations on a disposable branch/local stack; run Supabase security/performance advisors.
3. Regenerate schema types from that new schema; configure Supabase Auth SSR with server-validated identity.
4. Implement onboarding, last-owner protections, invitation validation and server-authorized membership management before exposing role controls.
5. Implement atomic publication with complete snapshot validation, assigned-assessor checks, independent reviewer separation, validity/expiry logic, and trustworthy source mapping.
6. Configure private Storage buckets and tenant-specific media policies before enabling uploads. No Storage bucket or permissive Storage policy is created here.
7. Validate actual Data API grants and RLS in the real Supabase stack. Recent Supabase changes remove automatic Data API exposure; explicit grants in these migrations address that difference.
8. Keep publishable keys separate from server-only keys; never place a service key in a `NEXT_PUBLIC_` variable. Add retention, processor agreements and backup procedures before the pilot.

The organisation-onboarding migration adds an immutable-for-client responsibility record and a controlled first-owner bootstrap. A verified, non-anonymous account can create only its own new organisation. The public RPC is an invoker wrapper around a restricted private definer; it accepts no user, tenant, role or version identifiers. Consent is validated and recorded with server time. No live database was provisioned because the active-free-project limit was reached.
