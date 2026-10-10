import sharp from 'sharp';
import { verificationReady, approvedOrganization } from '@/lib/verification-server';
import { NextResponse } from 'next/server';
import { confirmedUser, createClient } from '@/lib/supabase/server';
import { limitedFormData, sameOrigin } from '@/lib/request-guards';
import { workspaceConfigured } from '@/lib/workspace-server';
import { MAX_ONLINE_PHOTO, PHOTO_BUCKET, uuidPattern } from '@/lib/workspace';

export const runtime='nodejs';
export const dynamic='force-dynamic';
const failure=(status:number)=>NextResponse.json({error:'photo-unavailable'},{status,headers:{'Cache-Control':'private, no-store'}});
async function session() {
  if(!workspaceConfigured()) return null;
  const supabase=await createClient();
  return !await confirmedUser(supabase) || !await verificationReady(supabase) ? null : supabase;
}
export async function POST(request:Request) {
  try {
    if(!sameOrigin(request)) return failure(403);
    const supabase=await session();if(!supabase) return failure(401);
    const data=await limitedFormData(request,MAX_ONLINE_PHOTO+65536);if(!data) return failure(413);const zoneId=String(data.get('zoneId') || '');const placeId=String(data.get('placeId') || '');const file=data.get('file');
    if(!uuidPattern.test(zoneId) || !uuidPattern.test(placeId) || !(file instanceof File) || file.type!=='image/webp' || file.size===0 || file.size>MAX_ONLINE_PHOTO) return failure(400);
    const zone=await supabase.from('zones').select('id,place_id,organization_id').eq('id',zoneId).eq('place_id',placeId).neq('status','archived').maybeSingle();
    if(zone.error || !zone.data || !await approvedOrganization(supabase,zone.data.organization_id)) return failure(404);
    const input=Buffer.from(await file.arrayBuffer());
    if(input.toString('ascii',0,4)!=='RIFF' || input.toString('ascii',8,12)!=='WEBP') return failure(400);
    // Decode and re-encode on the server too: clients cannot bypass metadata stripping.
    const image=sharp(input,{limitInputPixels:25_000_000,animated:false});
    const metadata=await image.metadata();if(metadata.format!=='webp' || (metadata.pages || 1)>1) return failure(400);
    const clean=await image.rotate().resize({width:1600,height:1600,fit:'inside',withoutEnlargement:true}).webp({quality:85}).toBuffer();
    if(clean.length>MAX_ONLINE_PHOTO) return failure(413);
    const id=crypto.randomUUID();const storageKey=`${zone.data.organization_id}/${zone.data.place_id}/${zone.data.id}/${id}.webp`;
    const upload=await supabase.storage.from(PHOTO_BUCKET).upload(storageKey,clean,{contentType:'image/webp',upsert:false,cacheControl:'0'});
    if(upload.error) return failure(400);
    return NextResponse.json({id,storageKey},{headers:{'Cache-Control':'private, no-store'}});
  } catch { return failure(400); }
}
export async function GET(request:Request) {
  try {
    const supabase=await session();if(!supabase) return failure(401);
    const key=new URL(request.url).searchParams.get('key') || '';const parts=key.split('/');
    if(parts.length!==4 || !parts.slice(0,3).every(p=>uuidPattern.test(p)) || !uuidPattern.test(parts[3].replace(/\.webp$/,'')) || !parts[3].endsWith('.webp')) return failure(404);
    if(!await approvedOrganization(supabase,parts[0])) return failure(404);
    const zone=await supabase.from('zones').select('id').eq('organization_id',parts[0]).eq('place_id',parts[1]).eq('id',parts[2]).neq('status','archived').maybeSingle();
    if(zone.error || !zone.data) return failure(404);
    const image=await supabase.storage.from(PHOTO_BUCKET).download(key);if(image.error || !image.data) return failure(404);
    return new Response(image.data,{headers:{'Content-Type':'image/webp','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
  } catch { return failure(404); }
}
