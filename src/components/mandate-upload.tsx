'use client';
import { useState } from 'react';
import type { Locale } from '@/lib/i18n';
import { getEvidenceCopy, MAX_EVIDENCE_BYTES, type MandateDocument } from '@/lib/mandate-evidence';
export function MandateUpload({locale,documents,onChange,onBusy}:{locale:Locale;documents:MandateDocument[];onChange:(docs:MandateDocument[])=>void;onBusy:(busy:boolean)=>void}) {
 const t=getEvidenceCopy(locale);const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');
 async function upload(file?:File) {
  if(!file) return;
  if(file.size===0 || file.size>MAX_EVIDENCE_BYTES || !['application/pdf','image/jpeg','image/png'].includes(file.type)) {setMessage(t.error);return;}
  setBusy(true);onBusy(true);setMessage('');
  try {
   const form=new FormData();form.set('file',file);
   const response=await fetch('/api/verification/documents',{method:'POST',body:form});
   if(!response.ok) throw new Error('Upload unavailable');
   const document=await response.json() as MandateDocument;
   onChange([...documents,document]);setMessage(t.uploaded);
  } catch {setMessage(t.error);} finally {setBusy(false);onBusy(false);}
 }
 return <section className="form-field wide" aria-labelledby="mandate-heading"><h3 id="mandate-heading">{t.title}</h3><p id="mandate-hint">{t.hint}</p>
  <label htmlFor="mandate-file">{t.upload}</label><input id="mandate-file" type="file" accept="application/pdf,image/jpeg,image/png" aria-describedby="mandate-hint" disabled={busy || documents.length>=3} onChange={event=>{void upload(event.target.files?.[0]);event.target.value='';}}/>
  {busy && <p role="status">{t.busy}</p>}{message && <p role="status">{message}</p>}
  {documents.length ? <ul>{documents.map(doc=><li key={doc.id}><input type="hidden" name="document" value={doc.id}/><a download href={`/api/verification/documents?id=${doc.id}`}>{doc.filename}</a> <button type="button" className="text-button" disabled={busy} onClick={()=>onChange(documents.filter(item=>item.id!==doc.id))}>{t.remove}: {doc.filename}</button></li>)}</ul> : <p>{t.required}</p>}
 </section>;
}
