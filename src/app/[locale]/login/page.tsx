import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getCopy,isLocale } from '@/lib/i18n';
export default async function Login({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();const t=getCopy(locale);return <main id="main-content" className="container"><div className="page-heading"><p className="eyebrow">{t.workspace}</p><h1>{t.loginTitle}</h1><p className="lead">{t.loginBody}</p></div><div className="content-body"><Link className="button" href={`/${locale}/dashboard`}>{t.openWorkspace}<ArrowRight size={18} aria-hidden="true"/></Link></div></main>;}
