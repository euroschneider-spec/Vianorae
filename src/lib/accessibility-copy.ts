import type { Locale } from './i18n';
const en={
  close:'Close reading settings',readingIntro:'Choose the text size, spacing and appearance that help you read. Your choices apply throughout the site.',
  withoutSound:'You can use this site without sound. Instructions, progress and messages are shown as text on screen.',
  display:'Guide display',stepByStep:'Step by step',fullText:'Complete guide in text',textTitle:'Your complete visit guide',
  textIntro:'All visit steps are together below. Nothing needs to be heard, played or timed to read the guide.',
  photoDescription:'Photograph description',
};
type AccessCopy={ [K in keyof typeof en]:string };
const ro:AccessCopy={
  close:'Închide setările de lectură',readingIntro:'Alege dimensiunea textului, spațierea și aspectul care te ajută să citești. Alegerile se aplică pe întregul site.',
  withoutSound:'Poți folosi acest site fără sunet. Instrucțiunile, progresul și mesajele sunt afișate ca text pe ecran.',
  display:'Afișarea ghidului',stepByStep:'Pas cu pas',fullText:'Ghid complet în text',textTitle:'Ghidul complet al vizitei',
  textIntro:'Toți pașii vizitei sunt împreună mai jos. Poți citi ghidul fără să asculți, să pornești o înregistrare sau să urmărești un cronometru.',
  photoDescription:'Descrierea fotografiei',
};
const de:AccessCopy={
  close:'Leseeinstellungen schließen',readingIntro:'Wählen Sie Textgröße, Abstände und Darstellung, die Ihnen beim Lesen helfen. Ihre Auswahl gilt auf der gesamten Website.',
  withoutSound:'Sie können diese Website ohne Ton nutzen. Anweisungen, Fortschritt und Meldungen erscheinen als Text auf dem Bildschirm.',
  display:'Guide-Darstellung',stepByStep:'Schritt für Schritt',fullText:'Vollständiger Guide als Text',textTitle:'Ihr vollständiger Besuchs-Guide',
  textIntro:'Alle Besuchsschritte stehen unten zusammen. Sie können den Guide ohne Ton, Wiedergabe oder Zeitvorgabe lesen.',
  photoDescription:'Fotobeschreibung',
};
export const getAccessCopy=(locale:Locale):AccessCopy=>({en,ro,de})[locale];
