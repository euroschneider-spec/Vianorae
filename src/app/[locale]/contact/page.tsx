import { notFound } from 'next/navigation';
import { getCopy,isLocale } from '@/lib/i18n';
import { ContactForm } from '@/components/contact-form';
export default async function Contact({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();const t=getCopy(locale);return <main id="main-content" className="container"><div className="page-heading"><p className="eyebrow">{t.contact}</p><h1>{t.contactTitle}</h1><p className="lead">{t.contactIntro}</p></div><div className="content-body prose"><ContactForm locale={locale}/></div></main>;}
