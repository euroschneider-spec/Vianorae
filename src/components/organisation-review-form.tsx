'use client';
import { useActionState, useState } from 'react';
import type { Locale } from '@/lib/i18n';
import { getVerificationCopy, type OrganizationApplication } from '@/lib/verification';
import { reviewOrganization } from '@/app/admin/actions';

export function OrganisationReviewForm({locale,application,self}:{locale:Locale;application:Pick<OrganizationApplication,'id'|'revision'|'status'>;self:boolean}) {
  const v=getVerificationCopy(locale);
  const initialDecision=application.status==='approved' ? 'suspended' : 'approved';
  const [decision,setDecision]=useState(initialDecision);
  const [state,submit,pending]=useActionState(reviewOrganization.bind(null,locale),{message:''});
  const approving=decision==='approved';
  if(self) return <p className="notice">{v.self}</p>;
  return <form action={submit} className="organisation-form">
    <input type="hidden" name="application" value={application.id}/><input type="hidden" name="revision" value={application.revision}/>
    <fieldset disabled={pending}><legend>{v.decision}</legend><div className="form-grid">
      <div className="form-field wide"><label htmlFor={`decision-${application.id}`}>{v.decision}</label><select id={`decision-${application.id}`} name="decision" value={decision} onChange={event=>setDecision(event.target.value)}>
        {application.status==='approved' ? <option value="suspended">{v.suspend}</option> : <><option value="approved">{v.approve}</option>{application.status!=='suspended' && <><option value="needs_information">{v.more}</option><option value="rejected">{v.reject}</option></>}</>}
      </select></div>
      <label className="form-field wide">{v.source}<input name="source" required={approving} minLength={approving?10:undefined} maxLength={1000}/></label>
      <label className="form-field wide">{v.evidence}<textarea name="evidence" required={approving} minLength={approving?20:undefined} maxLength={2000} rows={3}/></label>
      <label className="form-field wide">{v.note}<textarea name="note" required minLength={10} maxLength={2000} rows={3}/></label>
    </div>
    {approving && <><label className="checkbox-label commitment"><input type="checkbox" name="entity" required/>{v.entity}</label><label className="checkbox-label commitment"><input type="checkbox" name="mandate" required/>{v.mandate}</label></>}
    <p>{v.audit}</p><button className="button" type="submit">{v.save}</button></fieldset>
    {state.message && <p role="status">{state.message}</p>}
  </form>;
}
