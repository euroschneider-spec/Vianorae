import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { NextResponse } from 'next/server';
import { confirmedUser, createClient } from '@/lib/supabase/server';
import { limitedFormData, sameOrigin } from '@/lib/request-guards';
import { authConfigured } from '@/lib/supabase/config';
import { evidenceReady } from '@/lib/verification-server';
import { EVIDENCE_BUCKET, MAX_EVIDENCE_BYTES } from '@/lib/mandate-evidence';
import { uuidPattern } from '@/lib/workspace';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const failure=(status:number)=>NextResponse.json({error:'document-unavailable'},{status,headers:{'Cache-Control':'private, no-store'}});
async function session() {
 if(!authConfigured()) return null;
 const supabase=await createClient();
 return await confirmedUser(supabase) ? supabase : null;
}
export async function POST(request:Request) {
 try {
  if(!sameOrigin(request)) return failure(403);
  const supabase=await session();if(!supabase) return failure(401);if(!await evidenceReady(supabase)) return failure(503);
  const form=await limitedFormData(request,MAX_EVIDENCE_BYTES+65536);if(!form) return failure(413);const file=form.get('file');
  if(!(file instanceof File) || file.size===0 || file.size>MAX_EVIDENCE_BYTES) return failure(400);
  const input=Buffer.from(await file.arrayBuffer());let clean:Buffer;let mime:string;
  if(file.type==='application/pdf') {
   // PDF is never executed/rendered by the application; downloads are attachments.
   if(!input.subarray(0,8).toString('ascii').match(/^%PDF-1\.[0-7]|^%PDF-2\.0/) || !input.subarray(-2048).toString('ascii').includes('%%EOF')) return failure(400);
   clean=input;mime='application/pdf';
  } else if(['image/jpeg','image/png'].includes(file.type)) {
   const image=sharp(input,{limitInputPixels:25_000_000,animated:false});const metadata=await image.metadata();
   if((metadata.pages||1)>1 || (file.type==='image/jpeg' && metadata.format!=='jpeg') || (file.type==='image/png' && metadata.format!=='png')) return failure(400);
   mime=file.type;const rotated=image.rotate().resize({width:2400,height:2400,fit:'inside',withoutEnlargement:true});
   clean=await (mime==='image/jpeg'?rotated.jpeg({quality:90}):rotated.png()).toBuffer();
  } else return failure(400);
  if(clean.length>MAX_EVIDENCE_BYTES) return failure(413);
  const filename=file.name.replace(/[\x00-\x1f\x7f/\\]/g,'_').slice(0,140).replace(/\.[^.]*$/,'') || 'mandate';
  const name=filename+(mime==='application/pdf'?'.pdf':mime==='image/jpeg'?'.jpg':'.png');
  const digest=createHash('sha256').update(clean).digest('hex');
  const reservation=await supabase.rpc('reserve_mandate_document',{original_name:name,content_type:mime,bytes:clean.length,digest});
  if(reservation.error || typeof reservation.data!=='string') return failure(400);
  const result=await supabase.from('organization_evidence_documents').select('*').eq('id',reservation.data).single();
  if(result.error || !result.data) return failure(400);
  const upload=await supabase.storage.from(EVIDENCE_BUCKET).upload(result.data.storage_key,clean,{contentType:mime,upsert:false,cacheControl:'0'});
  if(upload.error) return failure(400);
  const complete=await supabase.rpc('complete_mandate_document',{document_id:result.data.id});
  if(complete.error || complete.data!==true) return failure(400);
  return NextResponse.json({...result.data,uploaded_at:new Date().toISOString()},{headers:{'Cache-Control':'private, no-store'}});
 } catch {return failure(400);}
}
export async function GET(request:Request) {
 try {
  const supabase=await session();if(!supabase) return failure(401);if(!await evidenceReady(supabase)) return failure(503);
  const id=new URL(request.url).searchParams.get('id') || '';if(!uuidPattern.test(id)) return failure(404);
  const result=await supabase.from('organization_evidence_documents').select('*').eq('id',id).maybeSingle();
  if(result.error || !result.data || !result.data.uploaded_at) return failure(404);
  const document=await supabase.storage.from(EVIDENCE_BUCKET).download(result.data.storage_key);if(document.error || !document.data) return failure(404);
  const bytes=Buffer.from(await document.data.arrayBuffer());
  if(bytes.length!==result.data.byte_size || createHash('sha256').update(bytes).digest('hex')!==result.data.sha256) return failure(404);
  return new Response(bytes,{headers:{'Content-Type':result.data.mime_type,'Content-Disposition':`attachment; filename="mandate.${result.data.mime_type==='application/pdf'?'pdf':result.data.mime_type==='image/jpeg'?'jpg':'png'}"; filename*=UTF-8''${encodeURIComponent(result.data.filename).replace(/['()*]/g,char=>'%'+char.charCodeAt(0).toString(16).toUpperCase())}`,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"sandbox; default-src 'none'",'Referrer-Policy':'no-referrer'}});
 } catch {return failure(404);}
}
