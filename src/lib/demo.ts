import type { Locale } from './i18n';
export type SensoryLevel = 'low' | 'moderate' | 'high' | 'variable' | 'unknown';
export type SensoryProfile = Record<'sound' | 'light' | 'crowding' | 'smell' | 'temperature' | 'visual', SensoryLevel>;
export type ZonePhoto = { id: string; alt: string; rights: string; photographedOn: string };
export type Zone = { id: string; title: string; description: string; note: string; next: string; illustration: string; sensory: SensoryProfile; photo?: ZonePhoto };
export type Guide = { schemaVersion: 1; title: string; locale: Locale; zones: Zone[]; sourceLevel: 'venue_provided'; isDemo: true };
const profiles: SensoryProfile[] = [
  { sound:'variable', light:'moderate', crowding:'variable', smell:'low', temperature:'variable', visual:'low' },
  { sound:'moderate', light:'moderate', crowding:'variable', smell:'low', temperature:'moderate', visual:'moderate' },
  { sound:'low', light:'moderate', crowding:'low', smell:'low', temperature:'moderate', visual:'moderate' },
  { sound:'variable', light:'variable', crowding:'moderate', smell:'low', temperature:'moderate', visual:'high' },
  { sound:'low', light:'low', crowding:'low', smell:'low', temperature:'moderate', visual:'low' }
];
const content: Record<Locale, string[][]> = {
  en: [
    ['The main entrance', 'A wide, step-free path leads to the glass doors. There is a bench beside the entrance. The doors open automatically.', 'Street sounds may be noticeable. You can pause on the bench before entering.', 'Go through the doors. Reception is on your left.'],
    ['Reception & the foyer', 'The reception desk is on your left. A staff member can explain the route. Toilets are along the corridor to the right.', 'Groups may gather here. Ask about a shorter route or a quieter place to wait.', 'Continue straight ahead to the first gallery.'],
    ['The collection gallery', 'Paintings hang on pale walls. There are benches in the centre. This example room has no background music.', 'Light is steady. You can walk around the room in either direction.', 'The next space is the interactive gallery. You can also go directly to the quiet room.'],
    ['The interactive gallery', 'Screens and hands-on displays fill this room. Some exhibits produce short sounds. Screen brightness can change.', 'You can skip this room. Staff can show you the route to the quiet room.', 'Continue to the quiet room, or return to reception.'],
    ['The quiet room', 'This small room has softer light, chairs and a window overlooking a garden. In this example, it is available throughout the visit.', 'Use the space for a pause. Ask staff if it is occupied. The room is not soundproof.', 'When you are ready, return to reception to leave or continue your visit.']
  ],
  ro: [
    ['Intrarea principală', 'Un traseu larg, fără trepte, duce la ușile de sticlă. Lângă intrare se află o bancă. Ușile se deschid automat.', 'Se pot auzi sunete de pe stradă. Poți lua o pauză pe bancă înainte de intrare.', 'Treci prin uși. Recepția este în stânga.'],
    ['Recepția și holul', 'Recepția este în stânga. Un membru al echipei poate explica traseul. Toaletele sunt pe coridorul din dreapta.', 'Aici se pot aduna grupuri. Poți cere un traseu mai scurt sau un loc mai liniștit pentru așteptare.', 'Mergi înainte spre prima galerie.'],
    ['Galeria colecției', 'Tablourile sunt expuse pe pereți deschiși la culoare. În centru sunt bănci. În această sală exemplu nu există muzică de fundal.', 'Lumina este constantă. Poți parcurge sala în ambele direcții.', 'Urmează galeria interactivă. Poți merge și direct la camera liniștită.'],
    ['Galeria interactivă', 'În sală sunt ecrane și exponate interactive. Unele emit sunete scurte. Luminozitatea ecranelor se poate schimba.', 'Poți sări această sală. Personalul îți poate arăta traseul către camera liniștită.', 'Continuă spre camera liniștită sau revino la recepție.'],
    ['Camera liniștită', 'Această cameră mică are lumină mai blândă, scaune și o fereastră spre grădină. În exemplu, este disponibilă pe parcursul vizitei.', 'Poți lua o pauză aici. Întreabă personalul dacă este ocupată. Camera nu este izolată fonic.', 'Când ești pregătit, revino la recepție pentru a ieși sau a continua vizita.']
  ],
  de: [
    ['Der Haupteingang', 'Ein breiter, stufenloser Weg führt zu den Glastüren. Neben dem Eingang steht eine Bank. Die Türen öffnen automatisch.', 'Straßengeräusche können hörbar sein. Auf der Bank können Sie vor dem Eintritt pausieren.', 'Gehen Sie durch die Türen. Der Empfang liegt links.'],
    ['Empfang & Foyer', 'Der Empfang liegt links. Das Personal kann den Weg erklären. Toiletten befinden sich im rechten Flur.', 'Hier können sich Gruppen sammeln. Fragen Sie nach einem kürzeren Weg oder einem ruhigeren Warteplatz.', 'Gehen Sie geradeaus zur ersten Galerie.'],
    ['Die Sammlungsgalerie', 'Gemälde hängen an hellen Wänden. In der Mitte stehen Bänke. In diesem Beispielraum gibt es keine Hintergrundmusik.', 'Das Licht ist gleichmäßig. Sie können in beide Richtungen durch den Raum gehen.', 'Als Nächstes folgt die interaktive Galerie. Sie können auch direkt zum Ruheraum gehen.'],
    ['Die interaktive Galerie', 'Bildschirme und interaktive Stationen füllen den Raum. Einige erzeugen kurze Geräusche. Die Bildschirmhelligkeit kann wechseln.', 'Sie können diesen Raum überspringen. Das Personal zeigt den Weg zum Ruheraum.', 'Weiter zum Ruheraum oder zurück zum Empfang.'],
    ['Der Ruheraum', 'Dieser kleine Raum bietet weicheres Licht, Stühle und ein Gartenfenster. Im Beispiel ist er während des Besuchs verfügbar.', 'Nutzen Sie den Raum für eine Pause. Fragen Sie, ob er besetzt ist. Er ist nicht schalldicht.', 'Kehren Sie zum Empfang zurück, um zu gehen oder den Besuch fortzusetzen.']
  ]
};
export function getDemoGuide(locale: Locale): Guide {
  return { schemaVersion:1, title: locale==='en' ? 'The Willow Museum' : locale==='ro' ? 'Muzeul Willow' : 'Das Willow Museum', locale, sourceLevel:'venue_provided', isDemo:true,
    zones: content[locale].map(([title,description,note,next], i) => ({ id:['entrance','reception','collection','interactive','quiet-room'][i], title,description,note,next, illustration:`/illustrations/${['entrance','reception','collection','interactive','quiet-room'][i]}.svg`, sensory: profiles[i] })) };
}
export const draftKey = (locale: Locale) => `vianorae:demo-draft:v1:${locale}`;
export function parseDraft(raw: string | null, locale: Locale): Guide {
  const fallback = getDemoGuide(locale);
  if (!raw) return fallback;
  try {
    const candidate = JSON.parse(raw) as Guide;
    const levels = ['low','moderate','high','variable','unknown'];
    if(candidate.schemaVersion !== 1 || candidate.locale !== locale || candidate.isDemo !== true || candidate.sourceLevel !== 'venue_provided' || typeof candidate.title !== 'string' || !candidate.title.trim() || candidate.title.length > 160 || !Array.isArray(candidate.zones) || candidate.zones.length !== 5) return fallback;
    for (let i=0; i<candidate.zones.length; i++) {
      const zone = candidate.zones[i];
      if(zone.id !== fallback.zones[i].id || ['title','description','note','next'].some(key => typeof zone[key as keyof Zone] !== 'string' || (zone[key as keyof Zone] as string).length > 2000) || !zone.title.trim() || !zone.description.trim() || !zone.sensory || Object.keys(profiles[i]).some(key => !levels.includes(zone.sensory[key as keyof SensoryProfile]))) return fallback;
    }
    return { ...candidate, zones: candidate.zones.map((zone,i)=>({
      ...zone, illustration:fallback.zones[i].illustration,
      photo: validPhoto(zone.photo) ? zone.photo : undefined,
    })) };
  } catch { return fallback; }
}

export function validPhoto(photo: unknown): photo is ZonePhoto {
  if (!photo || typeof photo !== 'object') return false;
  const value = photo as ZonePhoto;
  return typeof value.id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.id)
    && typeof value.alt === 'string' && Boolean(value.alt.trim()) && value.alt.length <= 500
    && typeof value.rights === 'string' && Boolean(value.rights.trim()) && value.rights.length <= 500
    && typeof value.photographedOn === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.photographedOn)
    && Number.isFinite(Date.parse(value.photographedOn))
    && new Date(value.photographedOn).toISOString().slice(0,10) === value.photographedOn
    && value.photographedOn <= new Date().toISOString().slice(0,10);
}
