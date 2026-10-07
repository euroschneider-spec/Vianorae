import type { Locale } from './i18n';
const en={
  tools:'Reading & audio',openSettings:'Open the panel to adjust the text or listen to this page.',
  listenPage:'Listen to this page',listenGuide:'Listen to the complete guide',listenStep:'Listen to this step',
  audioIntro:'Optional spoken text. No autoplay. Voices depend on your browser and device; some need an internet connection.',
  audioStart:'Read aloud',audioRestart:'Read from the beginning',audioPause:'Pause',audioResume:'Resume',audioStop:'Stop',audioSpeed:'Reading speed',
  audioReady:'Ready. Reading starts only when you choose it.',audioPlaying:'Reading aloud.',audioPaused:'Reading paused.',audioFinished:'Reading finished.',
  audioUnsupported:'This browser cannot read aloud. You can use your device’s screen reader with the same text.',
  audioNoVoice:'No English voice is available yet. Enable an English voice on your device and try again, or use your screen reader.',
  audioError:'Reading could not continue. Try again or use your device’s screen reader.',

  close:'Close reading settings',readingIntro:'Choose the text size, spacing and appearance that help you read. Your choices apply throughout the site.',
  withoutSound:'You can use this site without sound. Instructions, progress and messages are shown as text on screen.',
  display:'Guide display',stepByStep:'Step by step',fullText:'Complete guide in text',textTitle:'Your complete visit guide',
  textIntro:'All visit steps are together below. Nothing needs to be heard, played or timed to read the guide.',
  photoDescription:'Photograph description',
};
type AccessCopy={ [K in keyof typeof en]:string };
const ro:AccessCopy={
  tools:'Lectură și audio',openSettings:'Deschide panoul pentru a ajusta textul sau a asculta pagina.',
  listenPage:'Ascultă pagina',listenGuide:'Ascultă ghidul complet',listenStep:'Ascultă acest pas',
  audioIntro:'Text citit cu voce, opțional. Fără pornire automată. Vocile depind de browser și dispozitiv; unele necesită internet.',
  audioStart:'Citește cu voce',audioRestart:'Citește de la început',audioPause:'Pauză',audioResume:'Continuă',audioStop:'Oprește',audioSpeed:'Viteza lecturii',
  audioReady:'Pregătit. Lectura începe doar la alegerea ta.',audioPlaying:'Lectură în curs.',audioPaused:'Lectură în pauză.',audioFinished:'Lectură încheiată.',
  audioUnsupported:'Acest browser nu poate citi cu voce. Poți folosi cititorul de ecran al dispozitivului pentru același text.',
  audioNoVoice:'Nu este disponibilă încă o voce în română. Activează o voce românească pe dispozitiv și reîncearcă sau folosește cititorul de ecran.',
  audioError:'Lectura nu a putut continua. Reîncearcă sau folosește cititorul de ecran al dispozitivului.',

  close:'Închide setările de lectură',readingIntro:'Alege dimensiunea textului, spațierea și aspectul care te ajută să citești. Alegerile se aplică pe întregul site.',
  withoutSound:'Poți folosi acest site fără sunet. Instrucțiunile, progresul și mesajele sunt afișate ca text pe ecran.',
  display:'Afișarea ghidului',stepByStep:'Pas cu pas',fullText:'Ghid complet în text',textTitle:'Ghidul complet al vizitei',
  textIntro:'Toți pașii vizitei sunt împreună mai jos. Poți citi ghidul fără să asculți, să pornești o înregistrare sau să urmărești un cronometru.',
  photoDescription:'Descrierea fotografiei',
};
const de:AccessCopy={
  tools:'Lesen und Audio',openSettings:'Öffnen Sie das Panel, um den Text anzupassen oder die Seite anzuhören.',
  listenPage:'Diese Seite anhören',listenGuide:'Den vollständigen Guide anhören',listenStep:'Diesen Schritt anhören',
  audioIntro:'Optionale Sprachausgabe ohne Autoplay. Stimmen hängen von Browser und Gerät ab; manche benötigen Internet.',
  audioStart:'Vorlesen',audioRestart:'Von Anfang an vorlesen',audioPause:'Pause',audioResume:'Fortsetzen',audioStop:'Stoppen',audioSpeed:'Lesegeschwindigkeit',
  audioReady:'Bereit. Das Vorlesen beginnt nur auf Ihren Wunsch.',audioPlaying:'Wird vorgelesen.',audioPaused:'Vorlesen pausiert.',audioFinished:'Vorlesen beendet.',
  audioUnsupported:'Dieser Browser kann nicht vorlesen. Sie können denselben Text mit dem Screenreader Ihres Geräts lesen.',
  audioNoVoice:'Noch keine deutsche Stimme verfügbar. Aktivieren Sie eine deutsche Stimme auf Ihrem Gerät und versuchen Sie es erneut oder nutzen Sie Ihren Screenreader.',
  audioError:'Das Vorlesen konnte nicht fortgesetzt werden. Versuchen Sie es erneut oder nutzen Sie den Screenreader Ihres Geräts.',

  close:'Leseeinstellungen schließen',readingIntro:'Wählen Sie Textgröße, Abstände und Darstellung, die Ihnen beim Lesen helfen. Ihre Auswahl gilt auf der gesamten Website.',
  withoutSound:'Sie können diese Website ohne Ton nutzen. Anweisungen, Fortschritt und Meldungen erscheinen als Text auf dem Bildschirm.',
  display:'Guide-Darstellung',stepByStep:'Schritt für Schritt',fullText:'Vollständiger Guide als Text',textTitle:'Ihr vollständiger Besuchs-Guide',
  textIntro:'Alle Besuchsschritte stehen unten zusammen. Sie können den Guide ohne Ton, Wiedergabe oder Zeitvorgabe lesen.',
  photoDescription:'Fotobeschreibung',
};
export const getAccessCopy=(locale:Locale):AccessCopy=>({en,ro,de})[locale];
