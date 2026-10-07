-- VIANORAE only. Additive migration; existing content is retained and access awaits review.
begin;
alter table public.organizations add column approval_status text not null default 'pending'
 check(approval_status in ('pending','approved','suspended'));
-- A verified entity cannot be renamed or activated through ordinary tenant updates.
revoke update on public.organizations from public,anon,authenticated;
revoke all on private.platform_admins from public,anon,authenticated;
-- The old onboarding RPC must no longer create active tenants, including direct API calls.
revoke all on function public.create_organisation(text,text,text,boolean,text) from public,anon,authenticated;
revoke all on function private.create_organisation(text,text,text,boolean,text) from public,anon,authenticated;

create function private.is_platform_admin() returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from private.platform_admins p join auth.users u on u.id=p.user_id
 where p.user_id=(select auth.uid()) and u.email_confirmed_at is not null and not coalesce(u.is_anonymous,false));
$$;
revoke all on function private.is_platform_admin() from public,anon;
grant execute on function private.is_platform_admin() to authenticated;
create function public.is_platform_admin() returns boolean language sql stable security invoker set search_path='' as $$
 select private.is_platform_admin();
$$;
revoke all on function public.is_platform_admin() from public,anon;
grant execute on function public.is_platform_admin() to authenticated;

create function private.organization_approved(org uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.organizations o where o.id=org and o.approval_status='approved');
$$;
revoke all on function private.organization_approved(uuid) from public;
grant execute on function private.organization_approved(uuid) to anon,authenticated;
create or replace function private.has_role(org uuid, roles public.organization_role[])
returns boolean language sql stable security definer set search_path='' as $$
 select private.organization_approved(org) and exists(select 1 from auth.users u where u.id=(select auth.uid())
 and u.email_confirmed_at is not null and not coalesce(u.is_anonymous,false)) and
 (exists(select 1 from public.organization_members m where m.organization_id=org and m.user_id=(select auth.uid()) and m.role=any(roles))
 or private.is_platform_admin());
$$;
-- Assigned assessors/reviewers must obey the same live tenant and Auth gate.
create or replace function private.is_assigned(assessment uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.assessment_assignments a join auth.users u on u.id=a.user_id
 where a.assessment_id=assessment and a.user_id=(select auth.uid()) and u.email_confirmed_at is not null
 and not coalesce(u.is_anonymous,false) and private.organization_approved(a.organization_id));
$$;
-- Even immutable public snapshots disappear immediately when a tenant is suspended.
create policy approved_guide_read on public.guides as restrictive for select to anon,authenticated using(private.organization_approved(organization_id));
create policy approved_version_read on public.guide_versions as restrictive for select to anon,authenticated using(private.organization_approved(organization_id));
create policy approved_qr_read on public.qr_redirects as restrictive for select to anon,authenticated using(private.organization_approved(organization_id));

create table public.organization_applications (
 id uuid primary key default gen_random_uuid(), applicant_id uuid not null unique references auth.users(id),
 applicant_email text not null, organization_id uuid unique references public.organizations(id),
 organization_name text not null check(length(btrim(organization_name)) between 1 and 160),
 organization_type text not null check(organization_type in ('institution','museum','hotel','cultural','public_service','other')),
 country_code text not null check(country_code ~ '^[A-Z]{2}$'),
 official_website text not null check(length(official_website) between 10 and 500 and official_website ~ '^https://[^[:space:]@]+\.[^[:space:]@]+$'),
 registry_reference text not null default '' check(length(registry_reference)<=300),
 representative_name text not null check(length(btrim(representative_name)) between 1 and 160),
 representative_role text not null check(length(btrim(representative_role)) between 2 and 160),
 authorization_description text not null check(length(btrim(authorization_description)) between 20 and 2000),
 statement_version text not null check(statement_version='2026-10-07-v1'),
 statement_locale text not null check(statement_locale in ('en','ro','de')),
 status text not null default 'pending' check(status in ('pending','needs_information','rejected','approved','suspended')),
 revision bigint not null default 1 check(revision>0),
 applicant_note text not null default '' check(length(applicant_note)<=2000),
 submitted_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index organization_applications_queue_idx on public.organization_applications(status,submitted_at);
create table public.organization_review_events (
 id uuid primary key default gen_random_uuid(), application_id uuid not null references public.organization_applications(id),
 actor_id uuid not null references auth.users(id), decision text not null check(decision in ('approved','needs_information','rejected','suspended')),
 application_revision bigint not null, application_snapshot jsonb not null,
 entity_confirmed boolean not null, mandate_confirmed boolean not null,
 verified_source text not null, evidence_reference text not null, applicant_note text not null,
 created_at timestamptz not null default now()
);
create index organization_review_events_application_idx on public.organization_review_events(application_id,created_at desc);
create index organization_review_events_actor_idx on public.organization_review_events(actor_id);
alter table public.organization_applications enable row level security;
alter table public.organization_review_events enable row level security;
revoke all on public.organization_applications,public.organization_review_events from public,anon,authenticated;
grant select on public.organization_applications,public.organization_review_events to authenticated;
grant all on public.organization_applications,public.organization_review_events to service_role;
create policy application_read on public.organization_applications for select to authenticated
 using(applicant_id=(select auth.uid()) or (select private.is_platform_admin()));
create policy review_event_read on public.organization_review_events for select to authenticated using((select private.is_platform_admin()));

-- These private definers perform the controlled first-membership and review operations.
-- Actor, email, tenant, owner role and timestamps are derived, never accepted from metadata.
create function private.submit_organization_application(application jsonb, expected_revision bigint)
returns uuid language plpgsql security definer set search_path='' as $$
declare actor uuid:=(select auth.uid()); account_email text; current_app public.organization_applications%rowtype;
 legacy_org uuid; result uuid;
begin
 select u.email into account_email from auth.users u where u.id=actor and u.email_confirmed_at is not null and not coalesce(u.is_anonymous,false);
 if actor is null or account_email is null then raise exception 'Verified account required' using errcode='42501'; end if;
 if jsonb_typeof(application) is distinct from 'object' or application->>'authority' is distinct from 'true'
 or application->>'responsibility' is distinct from 'true' then raise exception 'Explicit acceptance required' using errcode='22023'; end if;
 perform pg_advisory_xact_lock(hashtextextended(actor::text,0));
 select * into current_app from public.organization_applications a where a.applicant_id=actor for update;
 if current_app.id is not null then
   if current_app.status in ('approved','suspended') then raise exception 'Access is managed by platform review' using errcode='42501'; end if;
   if current_app.status='pending' then return current_app.id; end if;
   if expected_revision is distinct from current_app.revision then raise exception 'Application revision changed' using errcode='40001'; end if;
   update public.organization_applications set
    applicant_email=account_email,organization_name=btrim(application->>'organisation'),organization_type=application->>'type',
    country_code=upper(btrim(application->>'country')),official_website=btrim(application->>'website'),
    registry_reference=btrim(coalesce(application->>'registry','')),representative_name=btrim(application->>'representative'),
    representative_role=btrim(application->>'representativeRole'),authorization_description=btrim(application->>'authorization'),
    statement_locale=application->>'locale',status='pending',revision=revision+1,applicant_note='',submitted_at=now(),updated_at=now()
    where id=current_app.id returning id into result;
 else
   if exists(select 1 from public.organization_members m join public.organizations o on o.id=m.organization_id
    where m.user_id=actor and m.role='owner' and o.approval_status in ('approved','suspended')) then
    raise exception 'Existing access is managed by platform review' using errcode='42501'; end if;
   if (select count(*) from public.organization_members m join public.organizations o on o.id=m.organization_id
    where m.user_id=actor and m.role='owner' and o.approval_status='pending')>1 then
    raise exception 'Contact platform administration for multiple existing organizations' using errcode='42501'; end if;
   select m.organization_id into legacy_org from public.organization_members m join public.organizations o on o.id=m.organization_id
    where m.user_id=actor and m.role='owner' and o.approval_status='pending' order by m.created_at limit 1;
   insert into public.organization_applications(applicant_id,applicant_email,organization_id,organization_name,organization_type,country_code,
    official_website,registry_reference,representative_name,representative_role,authorization_description,statement_version,statement_locale)
    values(actor,account_email,legacy_org,btrim(application->>'organisation'),application->>'type',upper(btrim(application->>'country')),
    btrim(application->>'website'),btrim(coalesce(application->>'registry','')),btrim(application->>'representative'),
    btrim(application->>'representativeRole'),btrim(application->>'authorization'),'2026-10-07-v1',application->>'locale') returning id into result;
 end if;
 return result;
end $$;
revoke all on function private.submit_organization_application(jsonb,bigint) from public,anon;
grant execute on function private.submit_organization_application(jsonb,bigint) to authenticated;
create function public.submit_organization_application(application jsonb, expected_revision bigint default null)
returns uuid language sql security invoker set search_path='' as $$
 select private.submit_organization_application(application,expected_revision);
$$;
revoke all on function public.submit_organization_application(jsonb,bigint) from public,anon;
grant execute on function public.submit_organization_application(jsonb,bigint) to authenticated;

create function private.review_organization_application(application_id uuid, expected_revision bigint, decision text,
 entity_confirmed boolean, mandate_confirmed boolean, verified_source text, evidence_reference text, applicant_note text)
returns uuid language plpgsql security definer set search_path='' as $$
declare actor uuid:=(select auth.uid()); request public.organization_applications%rowtype; org uuid; confirmed_email text;
begin
 if not private.is_platform_admin() then raise exception 'Platform administrator required' using errcode='42501'; end if;
 select * into request from public.organization_applications a where a.id=application_id for update;
 if request.id is null then raise exception 'Application not found' using errcode='22023'; end if;
 if request.applicant_id=actor then raise exception 'A different administrator must review your own application' using errcode='42501'; end if;
 if request.revision is distinct from expected_revision then raise exception 'Application revision changed' using errcode='40001'; end if;
 if decision is null or decision not in ('approved','needs_information','rejected','suspended')
 or applicant_note is null or length(btrim(applicant_note)) not between 10 and 2000
 or length(coalesce(verified_source,''))>1000 or length(coalesce(evidence_reference,''))>2000 then
 raise exception 'Invalid review' using errcode='22023'; end if;
 if (request.status='approved' and decision<>'suspended') or (request.status<>'approved' and decision='suspended')
 or (request.status='suspended' and decision<>'approved') then raise exception 'Invalid review transition' using errcode='22023'; end if;
 org:=request.organization_id;
 if decision='approved' then
   if entity_confirmed is distinct from true or mandate_confirmed is distinct from true
    or length(btrim(coalesce(verified_source,'')))<10 or length(btrim(coalesce(evidence_reference,'')))<20 then
    raise exception 'Independent entity and mandate verification required' using errcode='22023'; end if;
   select u.email into confirmed_email from auth.users u where u.id=request.applicant_id
    and u.email_confirmed_at is not null and not coalesce(u.is_anonymous,false);
   if confirmed_email is distinct from request.applicant_email then raise exception 'Applicant identity changed; obtain a new verified application' using errcode='42501'; end if;
   insert into public.users(id,display_name) values(request.applicant_id,request.representative_name) on conflict(id) do nothing;
   if org is null then
    insert into public.organizations(name,organization_type,country_code,approval_status)
     values(request.organization_name,request.organization_type,request.country_code,'approved') returning id into org;
    insert into public.organization_members(organization_id,user_id,role) values(org,request.applicant_id,'owner');
   else
    if not exists(select 1 from public.organization_members m where m.organization_id=org and m.user_id=request.applicant_id and m.role='owner')
     then raise exception 'Applicant mandate has changed' using errcode='42501'; end if;
    update public.organizations set name=request.organization_name,organization_type=request.organization_type,
     country_code=request.country_code,approval_status='approved' where id=org;
   end if;
   insert into public.organization_acknowledgements(organization_id,user_id,representative_name,statement_version,statement_locale)
    values(org,request.applicant_id,request.representative_name,request.statement_version,request.statement_locale) on conflict do nothing;
 elsif decision='suspended' then
   update public.organizations set approval_status='suspended' where id=org;
 end if;
 insert into public.organization_review_events(application_id,actor_id,decision,application_revision,application_snapshot,
  entity_confirmed,mandate_confirmed,verified_source,evidence_reference,applicant_note)
  values(request.id,actor,decision,request.revision,to_jsonb(request),coalesce(entity_confirmed,false),coalesce(mandate_confirmed,false),
   btrim(coalesce(verified_source,'')),btrim(coalesce(evidence_reference,'')),btrim(applicant_note));
 update public.organization_applications a set organization_id=org,status=decision,revision=a.revision+1,
  applicant_note=btrim(review_organization_application.applicant_note),updated_at=now() where a.id=request.id;
 return request.id;
end $$;
revoke all on function private.review_organization_application(uuid,bigint,text,boolean,boolean,text,text,text) from public,anon;
grant execute on function private.review_organization_application(uuid,bigint,text,boolean,boolean,text,text,text) to authenticated;
create function public.review_organization_application(application_id uuid, expected_revision bigint, decision text,
 entity_confirmed boolean, mandate_confirmed boolean, verified_source text, evidence_reference text, applicant_note text)
returns uuid language sql security invoker set search_path='' as $$
 select private.review_organization_application(application_id,expected_revision,decision,entity_confirmed,mandate_confirmed,verified_source,evidence_reference,applicant_note);
$$;
revoke all on function public.review_organization_application(uuid,bigint,text,boolean,boolean,text,text,text) from public,anon;
grant execute on function public.review_organization_application(uuid,bigint,text,boolean,boolean,text,text,text) to authenticated;
create function public.organization_verification_schema_version() returns integer language sql immutable security invoker set search_path='' as $$ select 1; $$;
revoke all on function public.organization_verification_schema_version() from public;
grant execute on function public.organization_verification_schema_version() to anon,authenticated;
notify pgrst,'reload schema';
commit;
