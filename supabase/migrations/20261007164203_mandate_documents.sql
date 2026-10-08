-- VIANORAE: immutable, private mandate evidence. Existing content and approvals are retained.
begin;
alter table public.organization_applications add column evidence_document_ids uuid[] not null default '{}';
alter table public.organization_review_events add column reviewed_document_ids uuid[] not null default '{}';
create table public.organization_evidence_documents (
 id uuid primary key default gen_random_uuid(), applicant_id uuid not null references auth.users(id),
 application_id uuid references public.organization_applications(id), storage_key text not null unique,
 filename text not null check(length(filename) between 1 and 160 and filename !~ '[[:cntrl:]/\\]'),
 mime_type text not null check(mime_type in ('application/pdf','image/jpeg','image/png')),
 byte_size integer not null check(byte_size between 1 and 3145728),
 uploaded_at timestamptz, sha256 text not null check(sha256 ~ '^[a-f0-9]{64}$'), created_at timestamptz not null default now()
);
create index organization_evidence_owner_idx on public.organization_evidence_documents(applicant_id,created_at);
create index organization_evidence_application_idx on public.organization_evidence_documents(application_id);
alter table public.organization_evidence_documents enable row level security;
revoke all on public.organization_evidence_documents from public,anon,authenticated;
grant select on public.organization_evidence_documents to authenticated;
grant all on public.organization_evidence_documents to service_role;
create function private.confirmed_evidence_user() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from auth.users u where u.id=(select auth.uid()) and u.email_confirmed_at is not null and not coalesce(u.is_anonymous,false));
$$;
revoke all on function private.confirmed_evidence_user() from public,anon;
grant execute on function private.confirmed_evidence_user() to authenticated;
create policy evidence_read on public.organization_evidence_documents for select to authenticated using(
 (select private.confirmed_evidence_user()) and (applicant_id=(select auth.uid()) or (application_id is not null and (select private.is_platform_admin()))));
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('vianorae-mandate-evidence','vianorae-mandate-evidence',false,3145728,array['application/pdf','image/jpeg','image/png']);
create function private.evidence_storage_access(object_key text, uploading boolean) returns boolean
 language sql stable security definer set search_path='' as $$
 select private.confirmed_evidence_user() and exists(select 1 from public.organization_evidence_documents d
 where d.storage_key=object_key and (
 (d.applicant_id=(select auth.uid()) and (not uploading or d.application_id is null))
 or (not uploading and d.application_id is not null and private.is_platform_admin())));
$$;
revoke all on function private.evidence_storage_access(text,boolean) from public,anon;
grant execute on function private.evidence_storage_access(text,boolean) to authenticated;
create policy mandate_evidence_read on storage.objects for select to authenticated
 using(bucket_id='vianorae-mandate-evidence' and private.evidence_storage_access(name,false));
create policy mandate_evidence_insert on storage.objects for insert to authenticated
 with check(bucket_id='vianorae-mandate-evidence' and private.evidence_storage_access(name,true));
-- No UPDATE/DELETE policy: evidence cannot be replaced during or after review.
create function private.reserve_mandate_document(original_name text,content_type text,bytes integer,digest text)
 returns uuid language plpgsql security definer set search_path='' as $$
declare actor uuid:=(select auth.uid()); document_id uuid:=gen_random_uuid(); extension text;
begin
 if not private.confirmed_evidence_user() then raise exception 'Confirmed account required' using errcode='42501'; end if;
 perform pg_advisory_xact_lock(hashtextextended(actor::text,0));
 if exists(select 1 from public.organization_applications a where a.applicant_id=actor and a.status in ('pending','approved','suspended')) then
  raise exception 'Documents are locked during review' using errcode='42501'; end if;
 if (select count(1) from public.organization_evidence_documents d where d.applicant_id=actor and d.created_at>now()-interval '1 day')>=10
 or (select count(1) from public.organization_evidence_documents d where d.applicant_id=actor)>=30 then
  raise exception 'Document upload limit reached; contact administration' using errcode='54000'; end if;
 extension:=case content_type when 'application/pdf' then 'pdf' when 'image/jpeg' then 'jpg' when 'image/png' then 'png' end;
 if extension is null then raise exception 'Unsupported document' using errcode='22023'; end if;
 insert into public.organization_evidence_documents(id,applicant_id,storage_key,filename,mime_type,byte_size,sha256)
 values(document_id,actor,actor::text||'/'||document_id::text||'.'||extension,original_name,content_type,bytes,digest);
 return document_id;
end $$;
revoke all on function private.reserve_mandate_document(text,text,integer,text) from public,anon;
grant execute on function private.reserve_mandate_document(text,text,integer,text) to authenticated;
create function public.reserve_mandate_document(original_name text,content_type text,bytes integer,digest text)
 returns uuid language sql security invoker set search_path='' as $$ select private.reserve_mandate_document(original_name,content_type,bytes,digest); $$;
revoke all on function public.reserve_mandate_document(text,text,integer,text) from public,anon;
grant execute on function public.reserve_mandate_document(text,text,integer,text) to authenticated;

create function private.complete_mandate_document(document_id uuid) returns boolean
 language plpgsql security definer set search_path='' as $$
begin
 if not private.confirmed_evidence_user() then raise exception 'Confirmed account required' using errcode='42501'; end if;
 update public.organization_evidence_documents d set uploaded_at=coalesce(d.uploaded_at,now()) where d.id=document_id
 and d.applicant_id=(select auth.uid()) and d.application_id is null
 and exists(select 1 from storage.objects o where o.bucket_id='vianorae-mandate-evidence' and o.name=d.storage_key);
 if not found then raise exception 'Uploaded document required' using errcode='42501'; end if;
 return true;
end $$;
revoke all on function private.complete_mandate_document(uuid) from public,anon;
grant execute on function private.complete_mandate_document(uuid) to authenticated;
create function public.complete_mandate_document(document_id uuid) returns boolean language sql security invoker set search_path='' as $$ select private.complete_mandate_document(document_id); $$;
revoke all on function public.complete_mandate_document(uuid) from public,anon;
grant execute on function public.complete_mandate_document(uuid) to authenticated;

-- Keep the original operation internal; direct callers cannot bypass document checks.
revoke all on function private.submit_organization_application(jsonb,bigint) from public,anon,authenticated;
create function private.submit_application_with_documents(application jsonb,expected_revision bigint)
 returns uuid language plpgsql security definer set search_path='' as $$
declare actor uuid:=(select auth.uid()); current_app public.organization_applications%rowtype; ids uuid[]; result uuid; supplied integer;
begin
 if not private.confirmed_evidence_user() then raise exception 'Confirmed account required' using errcode='42501'; end if;
 perform pg_advisory_xact_lock(hashtextextended(actor::text,0));
 select * into current_app from public.organization_applications a where a.applicant_id=actor for update;
 -- Idempotent retries cannot change a pending submission or its evidence.
 if current_app.status='pending' then return current_app.id; end if;
 if jsonb_typeof(application->'documents') is distinct from 'array' then raise exception 'Mandate documents required' using errcode='22023'; end if;
 supplied:=jsonb_array_length(application->'documents');
 if supplied not between 1 and 3 then raise exception 'One to three mandate documents required' using errcode='22023'; end if;
 select array_agg(distinct value::uuid order by value::uuid) into ids from jsonb_array_elements_text(application->'documents');
 if cardinality(ids)<>supplied then raise exception 'Duplicate evidence' using errcode='22023'; end if;
 perform d.id from public.organization_evidence_documents d where d.id=any(ids) order by d.id for update;
 if (select count(1) from public.organization_evidence_documents d where d.id=any(ids) and d.uploaded_at is not null and d.applicant_id=actor
 and (d.application_id is null or d.application_id=current_app.id)
 and exists(select 1 from storage.objects o where o.bucket_id='vianorae-mandate-evidence' and o.name=d.storage_key))<>supplied then
  raise exception 'Documents must be uploaded by the applicant' using errcode='42501'; end if;
 result:=private.submit_organization_application(application,expected_revision);
 update public.organization_evidence_documents d set application_id=result where d.id=any(ids) and d.application_id is null;
 update public.organization_applications a set evidence_document_ids=ids where a.id=result;
 return result;
end $$;
revoke all on function private.submit_application_with_documents(jsonb,bigint) from public,anon;
grant execute on function private.submit_application_with_documents(jsonb,bigint) to authenticated;
create or replace function public.submit_organization_application(application jsonb,expected_revision bigint default null)
 returns uuid language sql security invoker set search_path='' as $$ select private.submit_application_with_documents(application,expected_revision); $$;

-- The eight-argument endpoint cannot approve without identifying the reviewed documents.
revoke all on function public.review_organization_application(uuid,bigint,text,boolean,boolean,text,text,text) from public,anon,authenticated;
revoke all on function private.review_organization_application(uuid,bigint,text,boolean,boolean,text,text,text) from public,anon,authenticated;
create function private.review_application_with_documents(application_id uuid,expected_revision bigint,decision text,
 entity_confirmed boolean,mandate_confirmed boolean,verified_source text,evidence_reference text,applicant_note text,reviewed_documents uuid[])
 returns uuid language plpgsql security definer set search_path='' as $$
declare request public.organization_applications%rowtype; reviewed uuid[]; result uuid;
begin
 if not private.is_platform_admin() then raise exception 'Platform administrator required' using errcode='42501'; end if;
 select * into request from public.organization_applications a where a.id=application_id for update;
 if request.id is null then raise exception 'Application not found' using errcode='42501'; end if;
 select coalesce(array_agg(distinct value order by value),'{}'::uuid[]) into reviewed from unnest(reviewed_documents) value;
 if decision='approved' then
  if cardinality(request.evidence_document_ids) not between 1 and 3 or reviewed is distinct from request.evidence_document_ids then
   raise exception 'Every submitted mandate document must be reviewed' using errcode='22023'; end if;
  if (select count(1) from public.organization_evidence_documents d where d.id=any(reviewed) and d.application_id=request.id
   and d.applicant_id=request.applicant_id and exists(select 1 from storage.objects o where o.bucket_id='vianorae-mandate-evidence' and o.name=d.storage_key))<>cardinality(reviewed) then
   raise exception 'Evidence is unavailable' using errcode='42501'; end if;
 elsif cardinality(reviewed)>0 then raise exception 'Only approval records document confirmation' using errcode='22023'; end if;
 result:=private.review_organization_application(application_id,expected_revision,decision,entity_confirmed,mandate_confirmed,verified_source,evidence_reference,applicant_note);
 update public.organization_review_events e set reviewed_document_ids=reviewed where e.application_id=request.id
  and e.application_revision=expected_revision and e.actor_id=(select auth.uid()) and e.decision=review_application_with_documents.decision;
 return result;
end $$;
revoke all on function private.review_application_with_documents(uuid,bigint,text,boolean,boolean,text,text,text,uuid[]) from public,anon;
grant execute on function private.review_application_with_documents(uuid,bigint,text,boolean,boolean,text,text,text,uuid[]) to authenticated;
create function public.review_organization_application(application_id uuid,expected_revision bigint,decision text,
 entity_confirmed boolean,mandate_confirmed boolean,verified_source text,evidence_reference text,applicant_note text,reviewed_documents uuid[])
 returns uuid language sql security invoker set search_path='' as $$
 select private.review_application_with_documents(application_id,expected_revision,decision,entity_confirmed,mandate_confirmed,verified_source,evidence_reference,applicant_note,reviewed_documents); $$;
revoke all on function public.review_organization_application(uuid,bigint,text,boolean,boolean,text,text,text,uuid[]) from public,anon;
grant execute on function public.review_organization_application(uuid,bigint,text,boolean,boolean,text,text,text,uuid[]) to authenticated;
create function public.mandate_evidence_schema_version() returns integer language sql immutable security invoker set search_path='' as $$ select 1; $$;
revoke all on function public.mandate_evidence_schema_version() from public;
grant execute on function public.mandate_evidence_schema_version() to anon,authenticated;
notify pgrst,'reload schema';
commit;
