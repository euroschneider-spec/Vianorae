import 'server-only';
import { isOrganisationRole, type Membership, type Viewer } from './roles';
import type { createClient } from './supabase/server';

type Client=Awaited<ReturnType<typeof createClient>>;

// Resolves both role tiers in one round trip. Pages read this instead of repeating the
// platform-admin check and the membership join. Returns null when any lookup fails, so callers
// fail closed rather than rendering as an unprivileged viewer.
export async function getViewer(supabase:Client,userId:string):Promise<Viewer|null> {
  const [adminResult,orgResult,memberResult]=await Promise.all([
    supabase.rpc('is_platform_admin'),
    supabase.from('organizations').select('id,name').eq('approval_status','approved').order('created_at').limit(50),
    supabase.from('organization_members').select('organization_id,role').eq('user_id',userId).limit(50),
  ]);
  if(adminResult.error || orgResult.error || memberResult.error) return null;
  const approved=new Map((orgResult.data||[]).map(row=>[row.id,row.name] as const));
  const memberships=(memberResult.data||[]).flatMap<Membership>(row=>{
    const name=approved.get(row.organization_id);
    return isOrganisationRole(row.role) && name!==undefined ? [{organisation:row.organization_id,name,role:row.role}] : [];
  });
  return {isPlatformAdmin:adminResult.data===true,memberships};
}
