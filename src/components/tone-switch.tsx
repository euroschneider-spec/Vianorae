'use client';
import { getAccessCopy } from '@/lib/accessibility-copy';
import type { Locale } from '@/lib/i18n';
import { setPreference, useTheme, useTone } from '@/lib/reading-prefs';

/**
 * Cool blue is the design; warm is for readers who find it too cold. High contrast keeps its own
 * fixed palette, so the control steps aside there rather than offering a choice that does nothing.
 */
export function ToneSwitch({locale}:{locale:Locale}) {
  const a=getAccessCopy(locale);const tone=useTone();
  if(useTheme()==='contrast')return null;
  return <div className="tone-switch" role="group" aria-label={a.toneLabel}>
    <button type="button" aria-pressed={tone==='cool'} onClick={()=>setPreference('tone','cool')}>{a.toneCool}</button>
    <button type="button" aria-pressed={tone==='warm'} onClick={()=>setPreference('tone','warm')}>{a.toneWarm}</button>
  </div>;
}
