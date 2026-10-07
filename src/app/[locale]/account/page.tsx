import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getCopy, isLocale } from '@/lib/i18n';
import { getOrganisationCopy } from '@/lib/organisation-copy';
import { authConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';
import { signOut } from '@/app/auth/actions';
import { OrganisationForm } from '@/components/organisation-form';
import { ResponsibilityNotice } from '@/components/responsibility-notice';
import { workspaceConfigured } from '@/lib/workspace-server';
import { getWorkspaceCopy } from '@/lib/workspace';
import { verificationReady } from '@/lib/verification-server';
import { getVerificationCopy, type OrganizationApplication } from '@/lib/verification';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Organisation account', robots: { index: false, follow: false } };
export default async function Account({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; if (!isLocale(locale)) notFound();
  const t=getOrganisationCopy(locale);const v=getVerificationCopy(locale);
  if (!authConfigured()) return <main id="main-content" className="container verification-page"><div className="page-heading"><h1>{t.account}</h1></div><p className="notice">{t.unavailable}</p><div className="content-body"><Link className="button" href={`/${locale}/dashboard`}>{getCopy(locale).openWorkspace}</Link></div></main>;
  const supabase=await createClient();const {data:{user},error}=await supabase.auth.getUser();
  if(error || !user || !user.email_confirmed_at || user.is_anonymous) redirect(`/${locale}/login`);
  if(!await verificationReady(supabase)) return <main id="main-content" className="container verification-page"><div className="page-heading"><h1>{t.account}</h1></div><p className="notice" role="status">{v.setup}</p><form action={signOut.bind(null,locale)}><button className="text-button">{t.signOut}</button></form></main>;
  const [orgResult,applicationResult,adminResult,roleResult]=await Promise.all([
    supabase.from('organizations').select('id,name').eq('approval_status','approved').order('created_at').limit(50),
    supabase.from('organization_applications').select('*').eq('applicant_id',user.id).maybeSingle(),
    supabase.rpc('is_platform_admin'),
    supabase.from('organization_members').select('organization_id').eq('user_id',user.id).limit(50),
  ]);
  if(orgResult.error || applicationResult.error || adminResult.error || roleResult.error) return <main id="main-content" className="container verification-page"><div className="page-heading"><h1>{t.account}</h1></div><p role="alert">{t.authError}</p></main>;
  const ownIds=new Set((roleResult.data||[]).map(row=>row.organization_id));
  const ownOrganizations=(orgResult.data||[]).filter(row=>ownIds.has(row.id));
  const application=applicationResult.data as OrganizationApplication|null;
  const suggestions=user.user_metadata.verification_suggestion;
  const suggestion=suggestions && typeof suggestions==='object' ? suggestions as Record<string,unknown> : {};
  const field=(name:string,max:number)=>typeof suggestion[name]==='string' ? String(suggestion[name]).slice(0,max) : '';
  const initial=application ? {organisation:application.organization_name,type:application.organization_type,representative:application.representative_name,website:application.official_website,country:application.country_code,registry:application.registry_reference,representativeRole:application.representative_role,authorization:application.authorization_description,revision:Number(application.revision)} : {
    organisation:field('organisation',160) || String(user.user_metadata.organisation_name||'').slice(0,160),
    type:field('type',30) || String(user.user_metadata.organisation_type||'institution').slice(0,30),
    representative:field('representative',160) || String(user.user_metadata.display_name||'').slice(0,160),
    website:field('website',500),country:field('country',2),registry:field('registry',300),representativeRole:field('representativeRole',160),authorization:field('authorization',2000),
  };
  return <main id="main-content" className="container verification-page"><div className="page-heading"><h1>{t.account}</h1></div><div className="content-body">
    {adminResult.data===true && <p><Link className="button" href={`/${locale}/admin/organisations`}>{v.admin}</Link></p>}
    <ResponsibilityNotice locale={locale}/>
    {application && <section className="notice" aria-labelledby="application-status"><h2 id="application-status">{v.statuses[application.status]}</h2><p>{application.organization_name}</p>{application.applicant_note && <p>{application.applicant_note}</p>}{application.status!=='approved' && <p>{v.gate}</p>}</section>}
    {ownOrganizations.length ? <><ul>{ownOrganizations.map(org=><li key={org.id}>{org.name}</li>)}</ul>{workspaceConfigured() ? <><p className="notice">{getWorkspaceCopy(locale).boundary}</p><Link className="button" href={`/${locale}/workspace`}>{getWorkspaceCopy(locale).workspace}</Link></> : <p className="notice">{t.liveBoundary}</p>}</> : null}
    {(!application || ['needs_information','rejected'].includes(application.status)) && !ownOrganizations.length && <OrganisationForm key={application?.revision || 'new'} locale={locale} mode="onboard" enabled initial={initial}/>}
    <p><Link className="quiet-link" href={`/${locale}/dashboard`}>{getCopy(locale).openWorkspace}</Link></p>
    <form action={signOut.bind(null,locale)}><button className="text-button" type="submit">{t.signOut}</button></form>
  </div></main>;
}
