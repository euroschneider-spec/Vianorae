import { notFound } from 'next/navigation';
import { getCopy,isLocale } from '@/lib/i18n';
import { ExploreCatalog } from '@/components/explore-catalog';
export default async function Explore({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();const t=getCopy(locale);return <main id="main-content" className="container"><div className="page-heading"><p className="eyebrow">{t.nav[3]}</p><h1>{t.exploreTitle}</h1><p className="lead">{t.exploreIntro}</p></div><div className="content-body"><ExploreCatalog locale={locale}/></div></main>;}
