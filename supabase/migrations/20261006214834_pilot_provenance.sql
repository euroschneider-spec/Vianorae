-- Pilot data structures, closed to client writes until verified server workflows exist.
begin;
create table public.assessors (
 id uuid primary key default gen_random_uuid(), user_id uuid not null unique references auth.users(id),
 training_status text not null default 'pending' check(training_status in ('pending','trained','suspended')),
 countries text[] not null default '{}', created_at timestamptz not null default now()
);
create table public.assessments (
 id uuid primary key default gen_random_uuid(), place_id uuid not null, organization_id uuid not null,
 method text not null check(length(method)>0), protocol_version text not null, assessed_on date not null,
 valid_until date not null check(valid_until>=assessed_on), assessor_id uuid not null references public.assessors(id),
 reviewer_id uuid references auth.users(id), instruments jsonb not null default '[]' check(jsonb_typeof(instruments)='array'),
 source_level public.source_level not null, status text not null default 'draft' check(status in ('draft','in_review','approved','expired','withdrawn')),
 created_at timestamptz not null default now(),
 foreign key(place_id,organization_id) references public.places(id,organization_id), unique(id,place_id,organization_id),
 check(source_level<>'venue_provided'), check(source_level<>'independent_audit' or reviewer_id is not null)
);
create index assessments_org_idx on public.assessments(organization_id);
create index assessments_assessor_idx on public.assessments(assessor_id);
create index assessments_reviewer_idx on public.assessments(reviewer_id);
create index assessments_expiry_idx on public.assessments(valid_until) where status='approved';
create table public.assessment_assignments (
 assessment_id uuid not null, place_id uuid not null, organization_id uuid not null, user_id uuid not null references auth.users(id),
 assignment_role text not null check(assignment_role in ('assessor','reviewer')), primary key(assessment_id,user_id),
 foreign key(assessment_id,place_id,organization_id) references public.assessments(id,place_id,organization_id)
);
create index assessment_assignments_user_idx on public.assessment_assignments(user_id,assessment_id);
create index assessment_assignments_org_idx on public.assessment_assignments(organization_id);
create table public.measurements (
 id uuid primary key default gen_random_uuid(), profile_id uuid not null, place_id uuid not null, organization_id uuid not null,
 assessment_id uuid not null, metric text not null check(metric in ('sound','light','temperature')), value numeric not null,
 unit text not null, instrument text not null check(length(instrument)>0), measured_at timestamptz not null, assessor_id uuid not null references public.assessors(id),
 foreign key(profile_id,place_id,organization_id) references public.sensory_profiles(id,place_id,organization_id),
 foreign key(assessment_id,place_id,organization_id) references public.assessments(id,place_id,organization_id),
 check((metric='sound' and unit='dB(A)') or (metric='light' and unit='lux') or (metric='temperature' and unit='C')),
 check(metric<>'light' or value>=0)
);
create index measurements_profile_time_idx on public.measurements(profile_id,measured_at);
create index measurements_assessment_idx on public.measurements(assessment_id);
create index measurements_assessor_idx on public.measurements(assessor_id);
create index measurements_org_idx on public.measurements(organization_id);
create table public.time_profiles (
 id uuid primary key default gen_random_uuid(), zone_id uuid not null, place_id uuid not null, organization_id uuid not null,
 days smallint[] not null check(days<@array[1,2,3,4,5,6,7]::smallint[] and cardinality(days)>0),
 from_time time not null, to_time time not null check(to_time>from_time), crowding_level public.sensory_level not null default 'unknown', sound_level public.sensory_level not null default 'unknown',
 foreign key(zone_id,place_id,organization_id) references public.zones(id,place_id,organization_id)
);
create index time_profiles_zone_idx on public.time_profiles(zone_id);
create index time_profiles_org_idx on public.time_profiles(organization_id);
create table public.relief_features (
 id uuid primary key default gen_random_uuid(), place_id uuid not null, organization_id uuid not null, zone_id uuid,
 low_stimulus_room boolean, quiet_hours text, loan_items text[] not null default '{}', staff_support text,
 foreign key(place_id,organization_id) references public.places(id,organization_id), foreign key(zone_id,place_id,organization_id) references public.zones(id,place_id,organization_id)
);
create index relief_features_place_idx on public.relief_features(place_id);
create index relief_features_zone_idx on public.relief_features(zone_id);
create index relief_features_org_idx on public.relief_features(organization_id);
create table public.reviews (
 id uuid primary key default gen_random_uuid(), assessment_id uuid not null, place_id uuid not null, organization_id uuid not null,
 reviewer_id uuid not null references auth.users(id), review_type text not null check(review_type in ('independent','factual_correction')),
 status text not null default 'pending' check(status in ('pending','approved','changes_requested')), notes text not null default '', created_at timestamptz not null default now(),
 foreign key(assessment_id,place_id,organization_id) references public.assessments(id,place_id,organization_id)
);
create index reviews_assessment_idx on public.reviews(assessment_id);
create index reviews_reviewer_idx on public.reviews(reviewer_id);
create index reviews_org_idx on public.reviews(organization_id);
create table public.external_certifications (
 id uuid primary key default gen_random_uuid(), place_id uuid not null, organization_id uuid not null, issuer text not null,
 scheme text not null, certificate_id text not null, valid_from date not null, valid_until date not null check(valid_until>=valid_from), url text check(url like 'https://%'),
 foreign key(place_id,organization_id) references public.places(id,organization_id)
);
create index external_certifications_place_idx on public.external_certifications(place_id);
create index external_certifications_org_idx on public.external_certifications(organization_id);
create function private.is_assigned(assessment uuid) returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from public.assessment_assignments a where a.assessment_id=assessment and a.user_id=auth.uid());
$$;
revoke all on function private.is_assigned(uuid) from public;
grant execute on function private.is_assigned(uuid) to authenticated;
alter table public.assessors enable row level security;
revoke all on public.assessors from anon,authenticated;
grant select on public.assessors to authenticated;
grant all on public.assessors to service_role;
create policy assessors_self_read on public.assessors for select to authenticated using(user_id=(select auth.uid()));
alter table public.assessments enable row level security;
revoke all on public.assessments from anon,authenticated;
grant select on public.assessments to authenticated;
grant all on public.assessments to service_role;
create policy assessments_staff_read on public.assessments for select to authenticated using(private.has_role(organization_id,array['owner','admin']::public.organization_role[]) or private.is_assigned(id));
create trigger assessments_tenant before update on public.assessments for each row execute function private.keep_tenant();
create trigger assessments_audit after insert or update on public.assessments for each row execute function private.audit_change();
alter table public.assessment_assignments enable row level security;
revoke all on public.assessment_assignments from anon,authenticated;
grant select on public.assessment_assignments to authenticated;
grant all on public.assessment_assignments to service_role;
create policy assessment_assignments_staff_read on public.assessment_assignments for select to authenticated using(private.has_role(organization_id,array['owner','admin']::public.organization_role[]) or private.is_assigned(assessment_id));
create trigger assessment_assignments_tenant before update on public.assessment_assignments for each row execute function private.keep_tenant();
alter table public.measurements enable row level security;
revoke all on public.measurements from anon,authenticated;
grant select on public.measurements to authenticated;
grant all on public.measurements to service_role;
create policy measurements_staff_read on public.measurements for select to authenticated using(private.has_role(organization_id,array['owner','admin']::public.organization_role[]) or private.is_assigned(assessment_id));
create trigger measurements_tenant before update on public.measurements for each row execute function private.keep_tenant();
create trigger measurements_audit after insert or update on public.measurements for each row execute function private.audit_change();
alter table public.time_profiles enable row level security;
revoke all on public.time_profiles from anon,authenticated;
grant select on public.time_profiles to authenticated;
grant all on public.time_profiles to service_role;
create policy time_profiles_staff_read on public.time_profiles for select to authenticated using(private.has_role(organization_id,array['owner','admin']::public.organization_role[]));
create trigger time_profiles_tenant before update on public.time_profiles for each row execute function private.keep_tenant();
alter table public.relief_features enable row level security;
revoke all on public.relief_features from anon,authenticated;
grant select on public.relief_features to authenticated;
grant all on public.relief_features to service_role;
create policy relief_features_staff_read on public.relief_features for select to authenticated using(private.has_role(organization_id,array['owner','admin']::public.organization_role[]));
create trigger relief_features_tenant before update on public.relief_features for each row execute function private.keep_tenant();
alter table public.reviews enable row level security;
revoke all on public.reviews from anon,authenticated;
grant select on public.reviews to authenticated;
grant all on public.reviews to service_role;
create policy reviews_staff_read on public.reviews for select to authenticated using(private.has_role(organization_id,array['owner','admin']::public.organization_role[]) or private.is_assigned(assessment_id));
create trigger reviews_tenant before update on public.reviews for each row execute function private.keep_tenant();
create trigger reviews_audit after insert or update on public.reviews for each row execute function private.audit_change();
alter table public.external_certifications enable row level security;
revoke all on public.external_certifications from anon,authenticated;
grant select on public.external_certifications to authenticated;
grant all on public.external_certifications to service_role;
create policy external_certifications_staff_read on public.external_certifications for select to authenticated using(private.has_role(organization_id,array['owner','admin']::public.organization_role[]));
create trigger external_certifications_tenant before update on public.external_certifications for each row execute function private.keep_tenant();
commit;
