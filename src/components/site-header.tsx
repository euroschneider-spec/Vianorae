'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef, useState } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { getCopy, locales, localeNames, type Locale } from '@/lib/i18n';
import { getOrganisationCopy } from '@/lib/organisation-copy';
import { contentPages } from '@/lib/content';
import { PageDensity } from './page-density';
import { ThemeToggle } from './theme-toggle';
import { ToneSwitch } from './tone-switch';
export function Brand() { return <span className="brand"><span className="brand-mark" aria-hidden="true"><span/><span/><span/></span>NERUMA</span>; }
export function SiteHeader({locale}:{locale:Locale}) {
  const t=getCopy(locale); const account=getOrganisationCopy(locale); const path=usePathname(); const [open,setOpen]=useState(false); const languageMenu=useRef<HTMLDetailsElement>(null);
  const languageLabel=locale==='ro'?'Limbă':locale==='de'?'Sprache':'Language';
  const closeLanguageMenu=()=>languageMenu.current?.removeAttribute('open');
  const routes=['how-it-works','for-organisations','methodology','explore'];
  const readable=contentPages.some(page=>path===`/${locale}/${page}`);
  return <>
    <a className="skip-link" href="#main-content">{t.skip}</a>
    {/* Language and appearance sit above the brand row: settings for the whole site, not navigation. */}
    <div className="topbar">
      <details
        className="language-switch"
        ref={languageMenu}
        onKeyDown={event=>{ if(event.key==='Escape') closeLanguageMenu(); }}
      >
        <summary aria-label={`${languageLabel}: ${localeNames[locale]}`}>
          {locale.toUpperCase()}
          <ChevronDown aria-hidden="true" />
        </summary>
        <nav aria-label={languageLabel}>
          {locales.map(lang=><Link key={lang} href={path.replace(/^\/(en|ro|de)(?=\/|$)/,`/${lang}`)} lang={lang} hrefLang={lang} aria-current={lang===locale?'page':undefined} onClick={closeLanguageMenu}>{localeNames[lang]}</Link>)}
        </nav>
      </details>
      {readable ? <PageDensity locale={locale}/> : null}
      <ToneSwitch locale={locale}/>
      <ThemeToggle locale={locale}/>
    </div>
    <header className="site-header"><div className="header-inner">
      <Link className="brand-link" href={`/${locale}`} aria-label="NERUMA"><Brand/></Link>
      <button className="menu-toggle icon-button" aria-label={open ? (locale==='ro'?'Închide meniul':locale==='de'?'Menü schließen':'Close menu') : (locale==='ro'?'Deschide meniul':locale==='de'?'Menü öffnen':'Open menu')} aria-expanded={open} aria-controls="site-navigation" onClick={()=>setOpen(!open)}>{open ? <X aria-hidden="true"/> : <Menu aria-hidden="true"/>}</button>
      <nav id="site-navigation" className={open?'navigation is-open':'navigation'} aria-label={locale==='ro'?'Navigare principală':locale==='de'?'Hauptnavigation':'Main navigation'}>
        {t.nav.map((name,i)=><Link key={routes[i]} href={`/${locale}/${routes[i]}`} aria-current={path===`/${locale}/${routes[i]}`?'page':undefined} onClick={()=>setOpen(false)}>{name}</Link>)}
      </nav>
      <div className="header-actions">
        <Link className="button button-small header-login" href={`/${locale}/login`} aria-current={path===`/${locale}/login`?'page':undefined}>{account.login}</Link>
      </div>
    </div></header>
  </>;
}
