'use server';

import { revalidatePath } from 'next/cache';
import { isLocale } from '@/lib/i18n';
import { createClient } from '@/lib/supabase/server';
import { parsePlaceDraft, uuidPattern } from '@/lib/workspace';
import { approvedOrganization } from '@/lib/verification-server';
import { workspaceConfigured } from '@/lib/workspace-server';
import { isOrganisationRole } from '@/lib/roles';

export type SaveResult = {ok:true;revision:number} | {ok:false;error:'invalid'|'conflict'|'auth'|'error'};
export async function savePlaceDraft(org: string, locale: string, input: unknown): Promise<SaveResult> {
  if (!workspaceConfigured() || !isLocale(locale) || !uuidPattern.test(org)) return {ok:false,error:'invalid'};
  const draft=parsePlaceDraft(input,org);
  if (!draft) return {ok:false,error:'invalid'};
  try {
    const supabase=await createClient();
    const {data:{user},error}=await supabase.auth.getUser();
    if(error || !user || !user.email_confirmed_at || user.is_anonymous) return {ok:false,error:'auth'};
    if(!await approvedOrganization(supabase,org)) return {ok:false,error:'auth'};
    const role=await supabase.from('organization_members').select('role').eq('user_id',user.id).eq('organization_id',org).maybeSingle();
    if(role.error || !role.data || !isOrganisationRole(role.data.role)) return {ok:false,error:'auth'};
    const result=await supabase.rpc('save_place_draft',{org,place:draft.id,expected_revision:draft.revision,content_locale:locale,draft});
    if(result.error) return {ok:false,error:result.error.code==='40001'?'conflict':result.error.code==='42501'?'auth':'error'};
    const revision=Number(result.data);
    if(!Number.isSafeInteger(revision) || revision<=draft.revision) return {ok:false,error:'error'};
    revalidatePath(`/${locale}/workspace`);
    revalidatePath(`/${locale}/workspace/${draft.id}`);
    revalidatePath(`/${locale}/workspace/${draft.id}/preview`);
    return {ok:true,revision};
  } catch { return {ok:false,error:'error'}; }
}
