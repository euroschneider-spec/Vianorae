'use client';
import { getAccessCopy } from '@/lib/accessibility-copy';
import type { Locale } from '@/lib/i18n';
import { setPreference, useDensity } from '@/lib/reading-prefs';

/**
 * Lets a reader choose how much of the page to show. Summary and full page are the same text,
 * not two versions of it: summary keeps each section's opening line and hides the rest, so
 * there is nothing to drift out of date. It sits beside language and appearance in the top bar,
 * and only on the pages it actually affects.
 */
export function PageDensity({locale}:{locale:Locale}) {
  const a=getAccessCopy(locale);const density=useDensity();
  return <div className="density-switch" role="group" aria-label={a.howMuch}>
    <button type="button" aria-pressed={density==='summary'} onClick={()=>setPreference('density','summary')}>{a.summary}</button>
    <button type="button" aria-pressed={density==='full'} onClick={()=>setPreference('density','full')}>{a.fullPage}</button>
  </div>;
}

/** Explains the hidden text where the effect is, rather than as a tooltip on the control. */
export function DensityNote({locale}:{locale:Locale}) {
  const a=getAccessCopy(locale);
  return useDensity()==='summary' ? <p className="notice density-note">{a.summaryNote}</p> : null;
}
