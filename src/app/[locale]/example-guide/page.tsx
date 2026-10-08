import { notFound } from 'next/navigation';
import { getCopy,isLocale } from '@/lib/i18n';
import { getAccessCopy } from '@/lib/accessibility-copy';
import { GuestGuide } from '@/components/guest-guide';
export async function generateMetadata({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return {title:isLocale(locale)?getCopy(locale).guide:'Guide'};}
export default async function ExampleGuide({params}:{params:Promise<{locale:string}>}) {
  const {locale}=await params;if(!isLocale(locale))notFound();const t=getCopy(locale);const a=getAccessCopy(locale);
  return <main id="main-content" className="container">
    <div className="page-heading"><p className="eyebrow">{t.guideEyebrow}</p><h1>{t.guideTitle}</h1><p className="lead">{t.guideIntro}</p><p className="badge">{t.demo}</p></div>
    {/* Framed at phone width: this is the guide as a visitor meets it, not a desktop rendition. */}
    <div className="guide-frame">
      <p className="small-label guide-frame-label">{a.visitorView}</p>
      <div className="guide-device">
        <GuestGuide locale={locale}/>
      </div>
    </div>
  </main>;
}
