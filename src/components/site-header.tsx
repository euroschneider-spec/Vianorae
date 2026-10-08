'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, ArrowUpRight, Globe2, UserRound } from 'lucide-react';
import { getCopy, locales, localeNames, type Locale } from '@/lib/i18n';
import { getOrganisationCopy } from '@/lib/organisation-copy';
import { getVerificationCopy } from '@/lib/verification';
export function Brand() { return <span className="brand"><span className="brand-mark" aria-hidden="true"><span/><span/><span/></span>NERUMA</span>; }
export function SiteHeader({locale}:{locale:Locale}) {
  const t=getCopy(locale); const organisation=getVerificationCopy(locale); const account=getOrganisationCopy(locale); const administration=locale==='ro'?'Administrare platformă':locale==='de'?'Plattformverwaltung':'Platform administration'; const path=usePathname(); const [open,setOpen]=useState(false);
  const routes=['how-it-works','for-organisations','methodology','explore'];
  return <><a className="skip-link" href="#main-content">{t.skip}</a><header className="site-header"><div className="header-inner">
    <Link className="brand-link" href={`/${locale}`} aria-label="NERUMA"><Brand/></Link>
    <button className="menu-toggle icon-button" aria-label={open ? (locale==='ro'?'Închide meniul':locale==='de'?'Menü schließen':'Close menu') : (locale==='ro'?'Deschide meniul':locale==='de'?'Menü öffnen':'Open menu')} aria-expanded={open} aria-controls="site-navigation" onClick={()=>setOpen(!open)}>{open ? <X aria-hidden="true"/> : <Menu aria-hidden="true"/>}</button>
    <nav id="site-navigation" className={open?'navigation is-open':'navigation'} aria-label={locale==='ro'?'Navigare principală':locale==='de'?'Hauptnavigation':'Main navigation'}>
      {t.nav.map((name,i)=><Link key={routes[i]} href={`/${locale}/${routes[i]}`} aria-current={path===`/${locale}/${routes[i]}`?'page':undefined} onClick={()=>setOpen(false)}>{name}</Link>)}
    </nav><div className="header-actions"><div className="language-switch"><Globe2 size={16} aria-hidden="true"/><nav aria-label={locale==='ro'?'Limbă':locale==='de'?'Sprache':'Language'}>{locales.map(lang=><Link key={lang} href={path.replace(/^\/(en|ro|de)(?=\/|$)/,`/${lang}`)} lang={lang} hrefLang={lang} aria-label={localeNames[lang]} aria-current={lang===locale?'page':undefined}>{lang.toUpperCase()}</Link>)}</nav></div><details className="account-menu"><summary className="account-link" aria-label={locale==='ro'?'Cont':locale==='de'?'Konto':'Account'}><UserRound size={18} aria-hidden="true"/><span>{locale==='ro'?'Cont':locale==='de'?'Konto':'Account'}</span></summary><nav aria-label={account.account} className="account-dropdown"><Link href={`/${locale}/account`}>{account.account}</Link><Link href={`/${locale}/login`}>{account.login}</Link><Link href={`/${locale}/register`}>{organisation.request}</Link><Link href={`/${locale}/admin/organisations`}>{administration}</Link></nav></details><Link className="button button-small header-cta" href={`/${locale}/example-guide`}>{t.guide}<ArrowUpRight size={15} aria-hidden="true"/></Link></div>
  </div></header></>;
}
