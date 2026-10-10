import 'server-only';
import { isOrganisationRole, type Membership, type Viewer } from './roles';
import type { SupabaseClient } from './supabase/server';

// Resolves both role tiers in one round trip. Pages read this instead of repeating the
// platform-admin check and the membership join. Returns null when any lookup fails, so callers
// fail closed rather than rendering as an unprivileged viewer.
export async function getViewer(supabase:SupabaseClient,userId:string):Promise<Viewer|null> {
  const [adminResult,orgResult,memberResult]=await Promise.all([
    supabase.rpc('is_platform_admin'),
    supabase.from('organizations').select('id,name').eq('approval_status','approved').order('created_at').limit(50),
    supabase.from('organization_members').select('organization_id,role').eq('user_id',userId).limit(50),
  ]);
  if(adminResult.error || orgResult.error || memberResult.error) return null;
  // Memberships follow the approved organisations' creation order, so "the first organisation"
  // is stable across requests; the membership query itself has no order.
  const roles=new Map((memberResult.data||[]).flatMap(row=>isOrganisationRole(row.role) ? [[row.organization_id,row.role] as const] : []));
  const memberships=(orgResult.data||[]).flatMap<Membership>(row=>{
    const role=roles.get(row.id);
    return role ? [{organisation:row.id,name:row.name,role}] : [];
  });
  return {isPlatformAdmin:adminResult.data===true,memberships};
}
