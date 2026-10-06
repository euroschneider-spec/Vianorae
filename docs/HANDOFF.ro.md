# VIANORAE · predare fundație v0.1

Proiectul este construit separat în `vianorae-platform`, pe baza planului din 6 octombrie 2026. Nu a fost modificat LIGNORAE, ArtisanCore, niciun domeniu, DNS, secret sau proiect existent. Nu a fost creată o bază live și nu au fost activate servicii plătite.

## Ce poți verifica

- `/en`, `/ro`, `/de`: landing și paginile publice.
- `/en/example-guide`: cinci zone Museum, date fictive, traseu pas cu pas și proveniență.
- `/en/dashboard`: structură de platformă pentru instituție.
- `/en/dashboard/builder`: editare și salvare în browser.
- `/en/dashboard/preview`: preview pentru draftul salvat.
- `/en/dashboard/share`: QR SVG și ruta stabilă a exemplului.

Autentificarea, încărcarea fotografiilor, publicarea live, invitațiile și emailurile sunt pentru etapa următoare. Formularul Contact pregătește o solicitare de copiat; nu trimite mesaje.

## Pornire

```sh
npm ci
npm run dev
```

Deschide `http://localhost:3000/en`. Nu sunt necesare chei sau conturi pentru demo.

## Destinația verificată

Repo-ul confirmat de proprietar este `euroschneider-spec/Vianorae`. Istoricul local păstrează și commitul său inițial, `f99fa8d9cf2ddec9d368ea2710a7031156b2f524`; nu este necesar force-push.

Proprietarul a autorizat proiectul Vercel legat la acest repo și a cerut independență completă față de celelalte proiecte. Proiectul a fost redenumit `vianorae-platform`, ID `prj_wxGgoaJGSuHR7ko74qEDGuJWMFzy`, în team-ul `euroschneider-6376s-projects`. Lista variabilelor configurate este goală. Nicio bază, aplicație sau cheie nu este reutilizată.

## Publicare pentru verificare

Fundația se publică pe ramura `foundation-v0.1` în `https://github.com/euroschneider-spec/Vianorae.git`. Istoricul inițial este păstrat fără force-push. `main` rămâne la commitul inițial până la verificare și promovare. Preview-ul folosește exclusiv proiectul `vianorae-platform`.

Setările sunt în `package.json`: `npm ci`, `npm run build`, framework Next.js și Node.js 24. Demo-ul nu necesită environment variables. Verifică URL-ul preview, limbile, ghidul și QR-ul după deployment. Domeniul, DNS-ul, billingul și celelalte proiecte rămân în afara acestei livrări.

Pentru continuare, vezi `NEXT-STEPS.md`. Rezultatele verificărilor și limitele lor sunt în `VERIFICATION.md`.
