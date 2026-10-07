import type { Locale } from './i18n';
import { getCopy } from './i18n';
import { getAccessCopy } from './accessibility-copy';
import type { Guide, Zone, SensoryProfile } from './demo';

// Short utterances avoid browser limits on long guides. No text is sent to an app API.
export function speechChunks(text:string):string[] {
  const chunks:string[]=[];
  for(const paragraph of text.split(/\n+/).map(value=>value.trim()).filter(Boolean)) {
    let rest=paragraph;
    while(rest.length>500) {
      const space=rest.lastIndexOf(' ',500);const end=space>0?space:500;
      chunks.push(rest.slice(0,end));rest=rest.slice(end).trim();
    }
    if(rest) chunks.push(rest);
  }
  return chunks;
}

export function spokenZone(zone:Zone,locale:Locale,index:number,total:number):string {
  const t=getCopy(locale);const a=getAccessCopy(locale);
  return [`${t.step} ${index+1} ${t.of} ${total}. ${zone.title}`,zone.description,
    zone.photo?`${a.photoDescription}: ${zone.photo.alt}. ${zone.photo.rights}. ${zone.photo.photographedOn}`:`${t.illustration}: ${zone.title}`,
    ...(['sound','light','crowding','smell','temperature','visual'] as (keyof SensoryProfile)[]).map(channel=>`${t[channel]}: ${t[zone.sensory[channel]]}`),
    `${t.support}. ${zone.note}`,`${t.predictability}. ${zone.next}`].filter(Boolean).join('\n');
}

export function spokenGuide(guide:Guide,locale:Locale):string {
  const t=getCopy(locale);
  return [guide.title,t.demo,t.source,...guide.zones.map((zone,index)=>spokenZone(zone,locale,index,guide.zones.length)),
    t.arrival,t.arrivalBody,t.general,t.generalBody,t.provenance,t.provenanceBody].join('\n');
}
