# VIANORAE · predare MVP în lucru

VIANORAE folosește exclusiv repo-ul `euroschneider-spec/Vianorae`, proiectul Vercel `vianorae-platform` și Supabase `uzlngrzokjzxvdfpctnt`. LIGNORAE și ArtisanCore nu au fost modificate. Nu au fost configurate domenii, DNS sau servicii plătite.

## Ce poți verifica

Preview: https://vianorae-platform-git-found-a20b14-euroschneider-6376s-projects.vercel.app

- `/ro/register`, `/ro/login`, `/ro/account`: cont și organizație; proprietarul a confirmat fluxul real de înscriere, confirmare email și creare a organizației.
- `/ro/workspace`: locațiile organizației autentificate.
- `/ro/workspace/new`: locație nouă, 1–8 zone de draft, descrieri și profiluri senzoriale.
- `/ro/workspace/[id]`: salvare online, fotografii private, ordine și pași opționali. Salvează prima dată zona înainte de upload. După upload, completează textul alternativ, drepturile și data, apoi salvează draftul.
- `/ro/workspace/[id]/preview`: previzualizarea versiunii salvate în bază.
- `/ro/dashboard`: demo local separat; exemplul fictiv Museum și QR-ul său rămân disponibile fără cont.

Editorul verifică revizia la fiecare salvare. Dacă altă sesiune a salvat între timp, refuză suprascrierea și păstrează textul nesalvat în pagină. Descrierile și pașii se salvează separat pe limbă; datele locației, fotografiile și profilurile senzoriale sunt comune. Fotografiile sunt redimensionate și re-encodate în browser și pe server pentru eliminarea metadatelor originale. Detașarea lor nu șterge fișierul privat.

Responsabilitatea organizației este explicată la înscriere și în editor, inclusiv impactul informațiilor asupra experienței vizitatorilor. Salvarea nu publică ghidul. Publicarea reală, verificarea responsabilului pentru versiunea publicată, invitațiile, recuperarea contului și un serviciu de email pentru utilizatori publici sunt pașii următori. Formularul Contact pregătește o solicitare de copiat; nu trimite mesaje.

## Configurare și livrare

Cele patru migrări au fost instalate manual de proprietar în proiectul nou. Schema are 24 de tabele publice cu RLS; API-ul confirmă `workspace_schema_version = 1`. Nu relua scriptul inițial și nu executa un CLI migration push înainte de reconcilierea istoricului manual. Integrarea administrativă nu are încă acces la noul cont Supabase.

Doar preview-ul ramurii `foundation-v0.1` are URL-ul, referința, cheia publică a acestui Supabase și `VIANORAE_WORKSPACE_ENABLED=1`. Nu există cheie service-role în aplicație. `main` păstrează commitul inițial până la verificare și promovare.

Pentru demo local: `npm ci`, apoi `npm run dev`. Pentru verificări: `npm run check`, `npm run test:e2e`, apoi `npm run test:workspace`, cu Chromium instalat. Ultima comandă folosește două organizații fictive și migrațiile reale în PostgreSQL izolat; serviciile HTTP Auth/Storage sunt simulate și nu accesează baza live.

Rezultatele și limitele verificărilor sunt în `VERIFICATION.md`. Următoarea etapă este descrisă în `NEXT-STEPS.md`.
