import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isLocale, getCopy } from '@/lib/i18n';
import { getOrganisationCopy } from '@/lib/organisation-copy';
import { getWorkspaceCopy } from '@/lib/workspace';
import { listPlaces, workspaceConfigured, workspaceSession } from '@/lib/workspace-server';

export const dynamic='force-dynamic';
export const metadata={title:'Organisation workspace',robots:{index:false,follow:false}};
export default async function Workspace({params,searchParams}:{params:Promise<{locale:string}>;searchParams:Promise<{org?:string}>}) {
  const {locale}=await params;if(!isLocale(locale)) notFound();
  const t=getWorkspaceCopy(locale);
  const context=await workspaceSession(locale);
  const {org:chosen}=await searchParams;
  const organisation=chosen ? context.organisations.find(o=>o.id===chosen) : context.organisations[0];
  if(chosen && !organisation) notFound();
  const places=organisation && workspaceConfigured() ? await listPlaces(context.supabase,organisation.id,locale) : [];
  return <main id="main-content" className="container"><div className="page-heading"><p className="eyebrow">VIANORAE</p><h1>{t.workspace}</h1>{organisation && <p className="lead">{organisation.name}</p>}</div>
    <div className="content-body"><p className="notice">{t.boundary}</p>
      {context.organisations.length>1 && <nav className="button-row" aria-label={getOrganisationCopy(locale).organisation}>{context.organisations.map(o=><Link key={o.id} className="quiet-link" href={`/${locale}/workspace?org=${o.id}`} aria-current={o.id===organisation?.id?'page':undefined}>{o.name}</Link>)}</nav>}
      {!workspaceConfigured() ? <p>{t.readyLater}</p> : !organisation ? <p>{t.forbidden}</p> : <>
        <Link className="button" href={`/${locale}/workspace/new?org=${organisation.id}`}>{t.newPlace}</Link>
        {!places.length ? <p>{t.empty}</p> : <ul className="workspace-locations">{places.map(place=><li key={place.id} className="workspace-location"><h2><Link href={`/${locale}/workspace/${place.id}`}>{place.name}</Link></h2><p>{place.city}</p><Link className="quiet-link" href={`/${locale}/workspace/${place.id}`}>{t.edit}</Link></li>)}</ul>}
      </>}
      <div className="button-row"><Link className="quiet-link" href={`/${locale}/account`}>{getOrganisationCopy(locale).account}</Link><Link className="quiet-link" href={`/${locale}/dashboard`}>{getCopy(locale).openWorkspace}</Link></div>
    </div></main>;
}
