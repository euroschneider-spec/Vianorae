import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { locales, isLocale, getCopy } from '@/lib/i18n';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { ReadingSettingsProvider } from '@/components/reading-settings';
import '../globals.css';
export function generateStaticParams(){return locales.map(locale=>({locale}));}
export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{const {locale}=await params;if(!isLocale(locale)) return {}; const t=getCopy(locale);return {title:{default:'NERUMA — '+t.footerLine,template:'%s | NERUMA'},description:t.heroDescription,robots:{index:false,follow:false},icons:{icon:'/favicon.svg'}};}
export default async function LocaleLayout({children,params}:{children:React.ReactNode;params:Promise<{locale:string}>}) {const {locale}=await params;if(!isLocale(locale))notFound();return <html lang={locale} suppressHydrationWarning><body><ReadingSettingsProvider locale={locale}><SiteHeader locale={locale}/>{children}<SiteFooter locale={locale}/></ReadingSettingsProvider></body></html>;}
