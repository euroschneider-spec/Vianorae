import 'server-only';
import type { createClient } from './supabase/server';

export async function verificationReady(supabase:Awaited<ReturnType<typeof createClient>>):Promise<boolean> {
  try {const {data,error}=await supabase.rpc('organization_verification_schema_version');return !error && data===1;} catch {return false;}
}
export async function approvedOrganization(supabase:Awaited<ReturnType<typeof createClient>>,org:string):Promise<boolean> {
  if(!await verificationReady(supabase)) return false;
  const {data,error}=await supabase.from('organizations').select('id').eq('id',org).eq('approval_status','approved').maybeSingle();
  return !error && !!data;
}

export async function evidenceReady(supabase:Awaited<ReturnType<typeof createClient>>):Promise<boolean> {
 try {const {data,error}=await supabase.rpc("mandate_evidence_schema_version");return !error && data===1;} catch {return false;}
}
