import type { RefObject } from 'react';
import { getCopy, type Locale } from '@/lib/i18n';
import { getAccessCopy } from '@/lib/accessibility-copy';
import type { Guide, SensoryProfile } from '@/lib/demo';

export function GuideText({locale,guide,headingRef}:{locale:Locale;guide:Guide;headingRef:RefObject<HTMLHeadingElement|null>}) {
  const t=getCopy(locale);const a=getAccessCopy(locale);
  return <section className="guide-text-view" aria-labelledby="guide-text-heading"><h2 id="guide-text-heading" ref={headingRef} tabIndex={-1}>{a.textTitle}</h2><p>{a.textIntro}</p>
    <ol className="guide-text-steps">{guide.zones.map((zone,index)=><li key={zone.id}>
      <p className="eyebrow">{t.step} {index+1} {t.of} {guide.zones.length}</p><h3>{zone.title}</h3>
      <p className="preserve-lines">{zone.description}</p>
      {zone.photo && <p className="small-note">{a.photoDescription}: {zone.photo.alt} · {zone.photo.rights} · {zone.photo.photographedOn}</p>}
      <dl className="draft-sensory">{(['sound','light','crowding','smell','temperature','visual'] as (keyof SensoryProfile)[]).map(channel=><div key={channel}><dt>{t[channel]}</dt><dd>{t[zone.sensory[channel]]}</dd></div>)}</dl>
      <h4>{t.support}</h4><p className="preserve-lines">{zone.note}</p><h4>{t.predictability}</h4><p className="preserve-lines">{zone.next}</p>
    </li>)}</ol>
  </section>;
}
