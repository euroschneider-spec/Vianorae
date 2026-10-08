import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { locales, isLocale, getCopy } from '@/lib/i18n';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { ReadingSettingsProvider } from '@/components/reading-settings';
import '../globals.css';
export function generateStaticParams(){return locales.map(locale=>({locale}));}
export const viewport:Viewport={width:'device-width',initialScale:1,themeColor:[{media:'(prefers-color-scheme: dark)',color:'#131519'},{media:'(prefers-color-scheme: light)',color:'#f6f7f9'}]};
export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{const {locale}=await params;if(!isLocale(locale)) return {}; const t=getCopy(locale);return {title:{default:'NERUMA — '+t.footerLine,template:'%s | NERUMA'},description:t.heroDescription,robots:{index:false,follow:false},icons:{icon:'/favicon.svg'}};}

// The reading preferences live in localStorage, so the stored theme, text size and spacing
// are reapplied before first paint. Without this, a visitor who chose light or high contrast
// would see one dark frame, because dark is the stylesheet default.
const restorePreferences=`try{var p=JSON.parse(localStorage.getItem('vianorae:reading:v1')||'null');var r=document.documentElement;if(p){if(['light','dark','contrast'].indexOf(p.theme)>-1)r.dataset.theme=p.theme;if(['normal','large','larger'].indexOf(p.size)>-1)r.dataset.textSize=p.size;if(typeof p.spacing==='boolean')r.dataset.spacing=String(p.spacing);}}catch(e){}`;

export default async function LocaleLayout({children,params}:{children:React.ReactNode;params:Promise<{locale:string}>}) {
  const {locale}=await params;if(!isLocale(locale))notFound();
  return <html lang={locale} data-theme="dark" suppressHydrationWarning>
    <head><script dangerouslySetInnerHTML={{__html:restorePreferences}}/></head>
    <body><ReadingSettingsProvider locale={locale}><SiteHeader locale={locale}/>{children}<SiteFooter locale={locale}/></ReadingSettingsProvider></body>
  </html>;
}
