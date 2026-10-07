'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, ArrowUpRight, Globe2, UserRound } from 'lucide-react';
import { getCopy, locales, localeNames, type Locale } from '@/lib/i18n';
import { getVerificationCopy } from '@/lib/verification';
export function Brand() { return <span className="brand"><span className="brand-mark" aria-hidden="true"><span/><span/><span/></span>VIANORAE</span>; }
export function SiteHeader({locale}:{locale:Locale}) {
  const t=getCopy(locale); const organisation=getVerificationCopy(locale); const path=usePathname(); const [open,setOpen]=useState(false);
  const routes=['how-it-works','for-organisations','methodology','explore'];
  return <><a className="skip-link" href="#main-content">{t.skip}</a><header className="site-header"><div className="header-inner">
    <Link className="brand-link" href={`/${locale}`} aria-label="VIANORAE"><Brand/></Link>
    <button className="menu-toggle icon-button" aria-label={open ? (locale==='ro'?'Închide meniul':locale==='de'?'Menü schließen':'Close menu') : (locale==='ro'?'Deschide meniul':locale==='de'?'Menü öffnen':'Open menu')} aria-expanded={open} aria-controls="site-navigation" onClick={()=>setOpen(!open)}>{open ? <X aria-hidden="true"/> : <Menu aria-hidden="true"/>}</button>
    <nav id="site-navigation" className={open?'navigation is-open':'navigation'} aria-label={locale==='ro'?'Navigare principală':locale==='de'?'Hauptnavigation':'Main navigation'}>
      {t.nav.map((name,i)=><Link key={routes[i]} href={`/${locale}/${routes[i]}`} aria-current={path===`/${locale}/${routes[i]}`?'page':undefined} onClick={()=>setOpen(false)}>{name}</Link>)}
    </nav><div className="header-actions"><div className="language-switch"><Globe2 size={16} aria-hidden="true"/><nav aria-label={locale==='ro'?'Limbă':locale==='de'?'Sprache':'Language'}>{locales.map(lang=><Link key={lang} href={path.replace(/^\/(en|ro|de)(?=\/|$)/,`/${lang}`)} lang={lang} hrefLang={lang} aria-label={localeNames[lang]} aria-current={lang===locale?'page':undefined}>{lang.toUpperCase()}</Link>)}</nav></div><Link className="account-link" href={`/${locale}/register`} aria-label={organisation.request}><UserRound size={18} aria-hidden="true"/><span>{organisation.request}</span></Link><Link className="button button-small header-cta" href={`/${locale}/example-guide`}>{t.guide}<ArrowUpRight size={15} aria-hidden="true"/></Link></div>
  </div></header></>;
}
