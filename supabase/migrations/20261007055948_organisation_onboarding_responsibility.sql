-- Only for a new, dedicated VIANORAE database. No live project is linked.
begin;
alter table public.organizations add column organization_type text not null default 'institution'
 check(organization_type in ('institution','museum','hotel','cultural','public_service','other'));
create table public.organization_acknowledgements (
 organization_id uuid not null references public.organizations(id),
 user_id uuid not null references auth.users(id),
 representative_name text not null check(length(btrim(representative_name)) between 1 and 160),
 statement_version text not null check(statement_version='2026-10-07-v1'),
 statement_locale text not null check(statement_locale in ('en','ro','de')),
 accepted_at timestamptz not null default now(),
 primary key(organization_id,user_id,statement_version)
);
alter table public.organization_acknowledgements enable row level security;
revoke all on public.organization_acknowledgements from public,anon,authenticated;
grant select on public.organization_acknowledgements to authenticated;
create policy acknowledgement_read on public.organization_acknowledgements for select to authenticated
 using(private.has_role(organization_id,array['owner','admin']::public.organization_role[]));
-- The private definer is necessary for the first member: ordinary RLS requires an
-- existing owner, and must never permit arbitrary users to join existing tenants.
create function private.create_organisation(organisation_name text, organisation_type text,
 representative_name text, accepted boolean, statement_locale text)
returns uuid language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); result uuid;
begin
 if actor is null or not exists(select 1 from auth.users u where u.id=actor
   and u.email_confirmed_at is not null and not coalesce(u.is_anonymous,false)) then
   raise exception 'A verified non-anonymous account is required' using errcode='42501';
 end if;
 if accepted is distinct from true or organisation_name is null or representative_name is null
   or length(btrim(organisation_name)) not between 1 and 160
   or length(btrim(representative_name)) not between 1 and 160
   or organisation_type is null or organisation_type not in ('institution','museum','hotel','cultural','public_service','other')
   or statement_locale is null or statement_locale not in ('en','ro','de') then
   raise exception 'Invalid organisation or acknowledgement' using errcode='22023';
 end if;
 -- Serialize first-time onboarding; retries cannot create duplicate organisations.
 perform pg_advisory_xact_lock(hashtextextended(actor::text,0));
 select m.organization_id into result from public.organization_members m
   where m.user_id=actor and m.role='owner' order by m.created_at,m.organization_id limit 1;
 if result is not null then return result; end if;
 insert into public.users(id,display_name) values(actor,btrim(representative_name)) on conflict(id) do nothing;
 insert into public.organizations(name,organization_type) values(btrim(organisation_name),organisation_type)
   returning id into result;
 insert into public.organization_members(organization_id,user_id,role) values(result,actor,'owner');
 insert into public.organization_acknowledgements(organization_id,user_id,representative_name,statement_version,statement_locale)
   values(result,actor,btrim(representative_name),'2026-10-07-v1',statement_locale);
 return result;
end;
$$;
revoke all on function private.create_organisation(text,text,text,boolean,text) from public,anon;
grant execute on function private.create_organisation(text,text,text,boolean,text) to authenticated;
-- The exposed entry point uses invoker security. No caller can choose a tenant,
-- user ID, owner role, timestamp or agreement version.
create function public.create_organisation(organisation_name text, organisation_type text,
 representative_name text, accepted boolean, statement_locale text)
returns uuid language sql security invoker set search_path='' as $$
 select private.create_organisation(organisation_name,organisation_type,representative_name,accepted,statement_locale);
$$;
revoke all on function public.create_organisation(text,text,text,boolean,text) from public,anon;
grant execute on function public.create_organisation(text,text,text,boolean,text) to authenticated;
commit;
