import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getCopy, isLocale } from '@/lib/i18n';
import { getOrganisationCopy } from '@/lib/organisation-copy';
import { authConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';
import { signOut } from '@/app/auth/actions';
import { OrganisationForm } from '@/components/organisation-form';
import { ResponsibilityNotice } from '@/components/responsibility-notice';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Organisation account', robots: { index: false, follow: false } };
export default async function Account({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; if (!isLocale(locale)) notFound();
  const t = getOrganisationCopy(locale);
  if (!authConfigured()) return <main id="main-content" className="container"><div className="page-heading"><h1>{t.account}</h1></div><p className="notice">{t.unavailable}</p><div className="content-body"><Link className="button" href={`/${locale}/dashboard`}>{getCopy(locale).openWorkspace}</Link></div></main>;
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user || !user.email_confirmed_at || user.is_anonymous) redirect(`/${locale}/login`);
  const { data: memberships, error: membershipError } = await supabase.from('organizations').select('id,name');
  if (membershipError) return <main id="main-content" className="container"><div className="page-heading"><h1>{t.account}</h1></div><p role="alert">{t.authError}</p></main>;
  const initial = {
    organisation: typeof user.user_metadata.organisation_name === 'string' ? user.user_metadata.organisation_name.slice(0,160) : '',
    type: typeof user.user_metadata.organisation_type === 'string' ? user.user_metadata.organisation_type : 'institution',
    representative: typeof user.user_metadata.display_name === 'string' ? user.user_metadata.display_name.slice(0,160) : '',
  };
  return <main id="main-content" className="container"><div className="page-heading"><h1>{memberships?.length ? t.account : t.onboarding}</h1></div><div className="content-body">
    <ResponsibilityNotice locale={locale}/>
    {memberships?.length ? <><ul>{memberships.map(organisation => <li key={organisation.id}>{organisation.name}</li>)}</ul><p className="notice">{t.liveBoundary}</p><Link className="button button-outline" href={`/${locale}/dashboard`}>{getCopy(locale).openWorkspace}</Link></> : <OrganisationForm locale={locale} mode="onboard" enabled initial={initial}/>}
    <form action={signOut.bind(null,locale)}><button className="text-button" type="submit">{t.signOut}</button></form>
  </div></main>;
}
