# Manual organisation verification

A confirmed email creates a personal sign-in, not an active organisation. The applicant submits the entity name and type, country, official website, optional public registry reference, representative name and role, and a description of how their authority can be confirmed. They explicitly accept the fixed responsibility statement. Website and email-domain matching are signals, never approval criteria on their own.

A platform administrator checks two things:

1. The entity exists and the submitted identity matches an independently obtained official source: a government website or registry, institutional directory, or equivalent reliable source.
2. The applicant is authorised to represent it. Confirm through an official contact obtained independently from that source, or verify a written mandate with its issuer. The applicant's supplied contact alone is insufficient.

Record the source, mandate confirmation reference/contact/method/date, both confirmations, and a message for the applicant. Do not approve an application until both checks are complete. Use “Request more information” or “Reject request” when evidence is incomplete or conflicting. Never collect passports or other identity scans through the free-text form. Verification concerns the organisation and representative; it does not certify the accuracy or accessibility of their visitor guides.

The review portal is `/{locale}/admin/organisations`, with EN/RO/DE translations. Only confirmed users explicitly present in `private.platform_admins` can open it or invoke the review RPC. Organisation `owner`/`admin` roles and editable Auth metadata cannot confer this permission. A different platform administrator must review an administrator's own application. Internal evidence and immutable decision events are readable only by platform administrators; applicants see their status and the applicant-facing note.

## Activation

Apply `supabase/migrations/20261007111624_organisation_verification.sql` once, after the existing four migrations, to the dedicated VIANORAE project `uzlngrzokjzxvdfpctnt`. Do not replay the original database installer. The owner delivery SQL combines this additive migration with an explicitly authorised initial administrator bootstrap; it validates the existing VIANORAE workspace schema and exactly one confirmed, non-anonymous Auth account with the selected email before changing anything. The selected email is an existing account in the VIANORAE database, not permission to access another application's database.

If the selected email has no confirmed VIANORAE Auth account, use the separate schema-only delivery SQL first. It assigns no platform roles and enables the new registration flow after deployment. Create and confirm the selected personal sign-in (or explicitly select an already confirmed account), then run the separate administrator bootstrap. The bootstrap refuses a missing/unconfirmed/ambiguous account.

An initial administrator role must be granted by trusted SQL administration, never by a public onboarding route. Granting this role does not approve that administrator's own organisation. A second, explicitly designated reviewer can be bootstrapped through trusted SQL administration when needed; there is no self-service admin promotion endpoint.

The application checks `organization_verification_schema_version() = 1`. If the migration is absent or inaccessible, registration, online editing and photo routes fail closed and explain that activation is in progress. The application gate alone cannot revoke an old database API: the SQL migration is required for the full security boundary. No service-role secret is added to the application.

## Existing organisations and enforcement

All existing organisations become `pending`; their content, memberships and private photos are retained. An existing owner submits the same verification information; the server links only that owner's pending organisation. Approval unlocks the existing data. Multiple pending organisations owned by one account require administrative handling rather than guessing which tenant to activate.

Approved new applications create exactly one tenant, a fixed owner membership and a responsibility acknowledgement in the same transaction as the review event. Tenant identity changes and approval-state changes are unavailable to ordinary clients. Existing private RLS and Storage checks require current approved status and a confirmed, non-anonymous Auth identity. Suspensions take effect on subsequent database/storage requests without requiring sign-out and also hide live public snapshots and QR redirects. The local fictional demo remains public.

The SQL rejects incomplete evidence, stale review/resubmission revisions, self-approval, direct application/event writes, unconfirmed/anonymous accounts, and approvals after the applicant's verified email changes. A submitted pending request cannot be silently edited under a reviewer. Requests for additional information and rejections allow a versioned resubmission. Suspended access can only be restored by a fresh manual review with the mandatory evidence.

## Validation

The isolated PostgreSQL security suite executes every real migration and exercises privilege escalation attempts, tenant isolation, direct API bypasses, evidence requirements, review revisions, legacy data retention and suspension. The isolated browser flow uses those migrations with simulated Auth/Storage HTTP services and covers request, information request, correction, approval, editing, private audit history, suspension and missing-migration gates. Public route, accessibility, reading/audio and local-demo regression checks remain part of CI.

No outbound review notifications are sent automatically. Administrators check the queue; applicants see decisions in their account. Supabase email confirmation still depends on the separately configured Auth URL and email delivery settings.
