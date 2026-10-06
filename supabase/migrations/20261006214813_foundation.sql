-- VIANORAE foundation. Apply only to a new, dedicated Supabase project.
-- No external project is linked or changed by this file.
begin;
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;
create type public.organization_role as enum ('owner','admin','editor','assessor','reviewer');
create type public.record_status as enum ('draft','published','archived');
create type public.sensory_level as enum ('unknown','low','moderate','high','variable');
create type public.source_level as enum ('venue_provided','assessor_verified','independent_audit');
create table public.users (
 id uuid primary key references auth.users(id), display_name text not null default '', created_at timestamptz not null default now()
);
create table public.organizations (
 id uuid primary key default gen_random_uuid(), name text not null check(length(name) between 1 and 160),
 country_code text check(country_code ~ '^[A-Z]{2}$'), status public.record_status not null default 'draft', created_at timestamptz not null default now()
);
create table public.organization_members (
 organization_id uuid not null references public.organizations(id), user_id uuid not null references auth.users(id),
 role public.organization_role not null, created_at timestamptz not null default now(), primary key(organization_id,user_id)
);
create index organization_members_user_idx on public.organization_members(user_id,organization_id);
create table private.platform_admins (user_id uuid primary key references auth.users(id));
alter table private.platform_admins enable row level security;
-- Internal membership lookup bypasses membership RLS recursion only. No caller-supplied user identity.
create function private.has_role(org uuid, roles public.organization_role[])
returns boolean language sql stable security definer set search_path = '' as $$
 select auth.uid() is not null and (
 exists(select 1 from public.organization_members m where m.organization_id=org and m.user_id=auth.uid() and m.role=any(roles))
 or exists(select 1 from private.platform_admins p where p.user_id=auth.uid()));
$$;
revoke all on function private.has_role(uuid,public.organization_role[]) from public;
grant execute on function private.has_role(uuid,public.organization_role[]) to authenticated;
create table public.templates (
 id uuid primary key default gen_random_uuid(), place_type text not null, version integer not null check(version>0),
 fields_config jsonb not null check(jsonb_typeof(fields_config)='object'), status public.record_status not null default 'draft', unique(place_type,version)
);
insert into public.templates(place_type,version,fields_config,status) values('museum',1,'{"min_zones":3,"max_zones":8,"sensory_channels":["sound","light","smell","crowding","temperature","visual"],"predictability":"visit_steps","source_level":"venue_provided"}','published');
create table public.places (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id),
 slug text not null unique check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'), country_code text check(country_code ~ '^[A-Z]{2}$'),
 city text not null, address text not null default '', place_type text not null default 'museum',
 status public.record_status not null default 'draft', template_id uuid references public.templates(id), created_at timestamptz not null default now(),
 unique(id,organization_id)
);
create index places_organization_idx on public.places(organization_id);
create index places_catalog_idx on public.places(country_code,city,place_type) where status='published';
create table public.place_translations (
 place_id uuid not null, organization_id uuid not null, locale text not null check(locale ~ '^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$'),
 name text not null check(length(name) between 1 and 160), short_description text not null default '', arrival_info text not null default '',
 primary key(place_id,locale), foreign key(place_id,organization_id) references public.places(id,organization_id)
);
create index place_translations_org_idx on public.place_translations(organization_id);
create table public.zones (
 id uuid primary key default gen_random_uuid(), place_id uuid not null, organization_id uuid not null, parent_zone_id uuid,
 type text not null, sort_order integer not null check(sort_order>=0), status public.record_status not null default 'draft',
 unique(id,place_id,organization_id), foreign key(place_id,organization_id) references public.places(id,organization_id),
 foreign key(parent_zone_id,place_id,organization_id) references public.zones(id,place_id,organization_id), check(parent_zone_id is distinct from id)
);
create index zones_place_idx on public.zones(place_id,sort_order);
create index zones_org_idx on public.zones(organization_id);
create index zones_parent_idx on public.zones(parent_zone_id);
create table public.zone_translations (
 zone_id uuid not null, place_id uuid not null, organization_id uuid not null, locale text not null check(locale ~ '^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$'),
 title text not null check(length(title) between 1 and 160), description text not null default '', useful_note text not null default '',
 primary key(zone_id,locale), foreign key(zone_id,place_id,organization_id) references public.zones(id,place_id,organization_id)
);
create index zone_translations_org_idx on public.zone_translations(organization_id);
create table public.media_assets (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null, place_id uuid not null, zone_id uuid,
 storage_key text not null unique, alt_text jsonb not null check(jsonb_typeof(alt_text)='object' and alt_text <> '{}'::jsonb),
 rights text not null check(length(rights)>0), sort_order integer not null default 0 check(sort_order>=0),
 foreign key(place_id,organization_id) references public.places(id,organization_id), foreign key(zone_id,place_id,organization_id) references public.zones(id,place_id,organization_id)
);
create index media_assets_place_idx on public.media_assets(place_id);
create index media_assets_zone_idx on public.media_assets(zone_id);
create index media_assets_org_idx on public.media_assets(organization_id);
create table public.sensory_profiles (
 id uuid primary key default gen_random_uuid(), zone_id uuid not null unique, place_id uuid not null, organization_id uuid not null,
 schema_version text not null default '0.1', source_level public.source_level not null default 'venue_provided' check(source_level='venue_provided'),
 sound_level public.sensory_level not null default 'unknown', light_level public.sensory_level not null default 'unknown', smell_level public.sensory_level not null default 'unknown',
 crowding_level public.sensory_level not null default 'unknown', temperature_level public.sensory_level not null default 'unknown', visual_complexity_level public.sensory_level not null default 'unknown',
 predictability_flags jsonb not null default '{}' check(jsonb_typeof(predictability_flags)='object'),
 foreign key(zone_id,place_id,organization_id) references public.zones(id,place_id,organization_id), unique(id,place_id,organization_id)
);
create index sensory_profiles_org_idx on public.sensory_profiles(organization_id);
create table public.guides (
 id uuid primary key default gen_random_uuid(), place_id uuid not null, organization_id uuid not null,
 locale text not null check(locale ~ '^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$'), status public.record_status not null default 'draft',
 current_version integer, published_at timestamptz, created_at timestamptz not null default now(),
 foreign key(place_id,organization_id) references public.places(id,organization_id), unique(place_id,locale), unique(id,place_id,organization_id),
 check(status<>'published' or (current_version is not null and published_at is not null))
);
create index guides_org_idx on public.guides(organization_id);
create table public.guide_steps (
 id uuid primary key default gen_random_uuid(), guide_id uuid not null, place_id uuid not null, organization_id uuid not null, zone_id uuid not null,
 sort_order integer not null check(sort_order>=0), optional boolean not null default false,
 foreign key(guide_id,place_id,organization_id) references public.guides(id,place_id,organization_id), foreign key(zone_id,place_id,organization_id) references public.zones(id,place_id,organization_id),
 unique(guide_id,sort_order), unique(guide_id,zone_id)
);
create index guide_steps_zone_idx on public.guide_steps(zone_id);
create index guide_steps_org_idx on public.guide_steps(organization_id);
-- Public visitors read immutable snapshots, never the mutable zone/content tables.
create table public.guide_versions (
 id uuid primary key default gen_random_uuid(), guide_id uuid not null, place_id uuid not null, organization_id uuid not null,
 version integer not null check(version>0), schema_version text not null default '0.1', methodology_version text not null default '0.1',
 source_level public.source_level not null default 'venue_provided' check(source_level='venue_provided'),
 content jsonb not null check(jsonb_typeof(content)='object' and content ? 'source_level' and content ? 'zones' and content->>'source_level'='venue_provided' and jsonb_typeof(content->'zones')='array' and jsonb_array_length(content->'zones') between 3 and 8),
 created_at timestamptz not null default now(), created_by uuid not null default auth.uid() references auth.users(id),
 foreign key(guide_id,place_id,organization_id) references public.guides(id,place_id,organization_id), unique(guide_id,version)
);
alter table public.guides add constraint guides_current_version_fk foreign key(id,current_version) references public.guide_versions(guide_id,version) deferrable initially deferred;
create index guide_versions_org_idx on public.guide_versions(organization_id);
create table public.qr_redirects (
 public_code text primary key check(public_code ~ '^[a-z0-9]+(-[a-z0-9]+)*$'), place_id uuid not null, organization_id uuid not null, guide_id uuid not null,
 foreign key(guide_id,place_id,organization_id) references public.guides(id,place_id,organization_id)
);
create index qr_redirects_guide_idx on public.qr_redirects(guide_id);
create index qr_redirects_org_idx on public.qr_redirects(organization_id);
create table public.audit_log (
 id bigint generated always as identity primary key, organization_id uuid not null references public.organizations(id), actor_id uuid references auth.users(id),
 entity_type text not null, entity_id text not null, action text not null check(action in ('INSERT','UPDATE')),
 before_json jsonb, after_json jsonb not null, created_at timestamptz not null default now()
);
create index audit_log_org_time_idx on public.audit_log(organization_id,created_at desc);
create index audit_log_actor_idx on public.audit_log(actor_id);
create function private.audit_change() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.audit_log(organization_id,actor_id,entity_type,entity_id,action,before_json,after_json)
 values(new.organization_id,auth.uid(),tg_table_name,to_jsonb(new)->>'id',tg_op,case when tg_op='UPDATE' then to_jsonb(old) else null end,to_jsonb(new));
 return new;
end $$;
revoke all on function private.audit_change() from public;
-- Prevent tenant reassignment even for a user belonging to two organisations.
create function private.keep_tenant() returns trigger language plpgsql security invoker set search_path='' as $$
begin if new.organization_id<>old.organization_id then raise exception 'Tenant reassignment is not allowed'; end if; return new; end $$;
revoke all on function private.keep_tenant() from public;
create function private.protect_publish() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if auth.uid() is not null and not private.has_role(new.organization_id,array['owner','admin']::public.organization_role[]) and
 ((tg_op='INSERT' and (new.status<>'draft' or new.current_version is not null or new.published_at is not null)) or
 (tg_op='UPDATE' and (new.status is distinct from old.status or new.current_version is distinct from old.current_version or new.published_at is distinct from old.published_at)))
 then raise exception 'Only owners and admins can publish'; end if; return new;
end $$;
revoke all on function private.protect_publish() from public;
create trigger protect_guide_publish before insert or update on public.guides for each row execute function private.protect_publish();
alter table public.users enable row level security;
revoke all on public.users from anon, authenticated;
alter table public.organizations enable row level security;
revoke all on public.organizations from anon, authenticated;
alter table public.organization_members enable row level security;
revoke all on public.organization_members from anon, authenticated;
alter table public.templates enable row level security;
revoke all on public.templates from anon, authenticated;
alter table public.places enable row level security;
revoke all on public.places from anon, authenticated;
alter table public.place_translations enable row level security;
revoke all on public.place_translations from anon, authenticated;
alter table public.zones enable row level security;
revoke all on public.zones from anon, authenticated;
alter table public.zone_translations enable row level security;
revoke all on public.zone_translations from anon, authenticated;
alter table public.media_assets enable row level security;
revoke all on public.media_assets from anon, authenticated;
alter table public.sensory_profiles enable row level security;
revoke all on public.sensory_profiles from anon, authenticated;
alter table public.guides enable row level security;
revoke all on public.guides from anon, authenticated;
alter table public.guide_steps enable row level security;
revoke all on public.guide_steps from anon, authenticated;
alter table public.guide_versions enable row level security;
revoke all on public.guide_versions from anon, authenticated;
alter table public.qr_redirects enable row level security;
revoke all on public.qr_redirects from anon, authenticated;
alter table public.audit_log enable row level security;
revoke all on public.audit_log from anon, authenticated;
grant select on public.templates,public.guides,public.guide_versions,public.qr_redirects to anon;
grant select on all tables in schema public to authenticated;
grant update on public.users,public.organizations to authenticated;
grant insert,update on public.organization_members to authenticated;
create policy users_self_read on public.users for select to authenticated using(id=(select auth.uid()));
create policy users_self_edit on public.users for update to authenticated using(id=(select auth.uid())) with check(id=(select auth.uid()));
create policy org_read on public.organizations for select to authenticated using(private.has_role(id,array['owner','admin','editor','assessor','reviewer']::public.organization_role[]));
create policy org_edit on public.organizations for update to authenticated using(private.has_role(id,array['owner']::public.organization_role[])) with check(private.has_role(id,array['owner']::public.organization_role[]));
create policy member_read on public.organization_members for select to authenticated using(private.has_role(organization_id,array['owner','admin','editor','assessor','reviewer']::public.organization_role[]));
create policy member_add on public.organization_members for insert to authenticated with check(private.has_role(organization_id,array['owner']::public.organization_role[]));
create policy member_edit on public.organization_members for update to authenticated using(private.has_role(organization_id,array['owner']::public.organization_role[])) with check(private.has_role(organization_id,array['owner']::public.organization_role[]));
create policy template_read on public.templates for select to anon,authenticated using(status='published');
create policy audit_read on public.audit_log for select to authenticated using(private.has_role(organization_id,array['owner','admin']::public.organization_role[]));
grant insert,update on public.places to authenticated;
create policy places_read on public.places for select to authenticated using(private.has_role(organization_id,array['owner','admin','editor']::public.organization_role[]));
create policy places_insert on public.places for insert to authenticated with check(private.has_role(organization_id,array['owner','admin','editor']::public.organization_role[]));
create policy places_update on public.places for update to authenticated using(private.has_role(organization_id,array['owner','admin','editor']::public.organization_role[])) with check(private.has_role(organization_id,array['owner','admin','editor']::public.organization_role[]));
create trigger places_tenant before update on public.places for each row execute function private.keep_tenant();
create trigger places_audit after insert or update on public.places for each row execute function private.audit_change();
grant insert,update on public.place_translations to authenticated;
create policy place_translations_read on public.place_translations for select to authenticated using(private.has_role(organization_id,array['owner','admin','editor']::public.organization_role[]));
create policy place_translations_insert on public.place_translations for insert to authenticated with check(private.has_role(organization_id,array['owner','admin','editor']::public.organization_role[]));
create policy place_translations_update on public.place_translations for update to authenticated using(private.has_role(organization_id,array['owner','admin','editor']::public.organization_role[])) with check(private.has_role(organization_id,array['owner','admin','editor']::public.organization_role[]));
create trigger place_translations_tenant before update on public.place_translations for each row execute function private.keep_tenant();
grant insert,update on public.zones to authenticated;
create policy zones_read on public.zones for select to authenticated using(private.has_role(organization_id,array['owner','admin','editor']::public.organization_role[]));
create policy zones_insert on public.zones for insert to authenticated with check(private.has_role(organization_id,array['owner','admin','editor']::public.organization_role[]));
create policy zones_update on public.zones for update to authenticated using(private.has_role(organization_id,array['owner','admin','editor']::public.organization_role[])) with check(private.has_role(organization_id,array['owner','admin','editor']::public.organization_role[]));
create trigger zones_tenant before update on public.zones for each row execute function private.keep_tenant();
create trigger zones_audit after insert or update on public.zones for each row execute function private.audit_change();
grant insert,update on public.zone_translations to authenticated;
create policy zone_translations_read on public.zone_translations for select to authenticated using(private.has_role(organization_id,array['owner','admin','editor']::public.organization_role[]));
create policy zone_translations_insert on public.zone_translations for insert to authenticated with check(private.has_role(organization_id,array['owner','admin','editor']::public.organization_role[]));
create policy zone_translations_update on public.zone_translations for update to authenticated using(private.has_role(organization_id,array['owner','admin','editor']::public.organization_role[])) with check(private.has_role(organization_id,array['owner','admin','editor']::public.organization_role[]));
create trigger zone_translations_tenant before update on public.zone_translations for each row execute function private.keep_tenant();
grant insert,update on public.media_assets to authenticated;
create policy media_assets_read on public.media_assets for select to authenticated using(private.has_role(organization_id,array['owner','admin','editor']::public.organization_role[]));
create policy media_assets_insert on public.media_assets for insert to authenticated with check(private.has_role(organization_id,array['owner','admin','editor']::public.organization_role[]));
create policy media_assets_update on public.media_assets for update to authenticated using(private.has_role(organization_id,array['owner','admin','editor']::public.organization_role[])) with check(private.has_role(organization_id,array['owner','admin','editor']::public.organization_role[]));
create trigger media_assets_tenant before update on public.media_assets for each row execute function private.keep_tenant();
grant insert,update on public.sensory_profiles to authenticated;
create policy sensory_profiles_read on public.sensory_profiles for select to authenticated using(private.has_role(organization_id,array['owner','admin','editor']::public.organization_role[]));
create policy sensory_profiles_insert on public.sensory_profiles for insert to authenticated with check(private.has_role(organization_id,array['owner','admin','editor']::public.organization_role[]));
create policy sensory_profiles_update on public.sensory_profiles for update to authenticated using(private.has_role(organization_id,array['owner','admin','editor']::public.organization_role[])) with check(private.has_role(organization_id,array['owner','admin','editor']::public.organization_role[]));
create trigger sensory_profiles_tenant before update on public.sensory_profiles for each row execute function private.keep_tenant();
create trigger sensory_profiles_audit after insert or update on public.sensory_profiles for each row execute function private.audit_change();
grant insert,update on public.guides to authenticated;
create policy guides_read on public.guides for select to authenticated using(private.has_role(organization_id,array['owner','admin','editor']::public.organization_role[]));
create policy guides_insert on public.guides for insert to authenticated with check(private.has_role(organization_id,array['owner','admin','editor']::public.organization_role[]));
create policy guides_update on public.guides for update to authenticated using(private.has_role(organization_id,array['owner','admin','editor']::public.organization_role[])) with check(private.has_role(organization_id,array['owner','admin','editor']::public.organization_role[]));
create trigger guides_tenant before update on public.guides for each row execute function private.keep_tenant();
create trigger guides_audit after insert or update on public.guides for each row execute function private.audit_change();
grant insert,update on public.guide_steps to authenticated;
create policy guide_steps_read on public.guide_steps for select to authenticated using(private.has_role(organization_id,array['owner','admin','editor']::public.organization_role[]));
create policy guide_steps_insert on public.guide_steps for insert to authenticated with check(private.has_role(organization_id,array['owner','admin','editor']::public.organization_role[]));
create policy guide_steps_update on public.guide_steps for update to authenticated using(private.has_role(organization_id,array['owner','admin','editor']::public.organization_role[])) with check(private.has_role(organization_id,array['owner','admin','editor']::public.organization_role[]));
create trigger guide_steps_tenant before update on public.guide_steps for each row execute function private.keep_tenant();
grant insert,update on public.qr_redirects to authenticated;
create policy qr_redirects_read on public.qr_redirects for select to authenticated using(private.has_role(organization_id,array['owner','admin','editor']::public.organization_role[]));
create policy qr_redirects_insert on public.qr_redirects for insert to authenticated with check(private.has_role(organization_id,array['owner','admin']::public.organization_role[]));
create policy qr_redirects_update on public.qr_redirects for update to authenticated using(private.has_role(organization_id,array['owner','admin']::public.organization_role[])) with check(private.has_role(organization_id,array['owner','admin']::public.organization_role[]));
create trigger qr_redirects_tenant before update on public.qr_redirects for each row execute function private.keep_tenant();
grant insert on public.guide_versions to authenticated;
create policy guide_versions_read on public.guide_versions for select to authenticated using(private.has_role(organization_id,array['owner','admin','editor']::public.organization_role[]));
create policy guide_versions_insert on public.guide_versions for insert to authenticated with check(private.has_role(organization_id,array['owner','admin']::public.organization_role[]));
create trigger guide_versions_audit after insert or update on public.guide_versions for each row execute function private.audit_change();
create trigger members_tenant before update on public.organization_members for each row execute function private.keep_tenant();
create policy public_guides on public.guides for select to anon,authenticated using(status='published');
create policy public_version on public.guide_versions for select to anon,authenticated using(exists(select 1 from public.guides g where g.id=guide_id and g.status='published' and g.current_version=version));
create policy public_qr on public.qr_redirects for select to anon,authenticated using(exists(select 1 from public.guides g where g.id=guide_id and g.status='published'));
revoke all on all sequences in schema public from anon,authenticated;
-- Service role is for a future trusted server only; never expose its key in the client.
grant usage on schema private to service_role;
grant all on all tables in schema public to service_role;
grant all on all tables in schema private to service_role;
grant usage,select on all sequences in schema public to service_role;
commit;
