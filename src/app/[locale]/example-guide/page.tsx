import { notFound } from 'next/navigation';
import { getCopy,isLocale } from '@/lib/i18n';
import { GuideViewer } from '@/components/guide-viewer';
export async function generateMetadata({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return {title:isLocale(locale)?getCopy(locale).guide:'Guide'};}
export default async function ExampleGuide({params}:{params:Promise<{locale:string}>}) {const {locale}=await params;if(!isLocale(locale))notFound();const t=getCopy(locale);return <main id="main-content" className="container"><div className="page-heading"><p className="eyebrow">{t.guideEyebrow}</p><h1>{t.guideTitle}</h1><p className="lead">{t.guideIntro}</p><p className="badge">{t.demo}</p></div><GuideViewer locale={locale}/></main>;}
