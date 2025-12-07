Obiettivo

- Uniformare V2 e V3 al tema scuro di default, generando e iniettando i design tokens in modo coerente con Tailwind e con la gestione del tema.
- Modificare l’estrattore dei tokens per produrre sia tokens.ts sia le variabili CSS ( :root e .dark ) necessarie.
Stato Attuale

- tailwind.config.ts:31-76 usa hsl(var(--background)) , hsl(var(--foreground)) , ecc.
- Le classi bg-background / text-foreground sono applicate in src/layouts/Layout.astro:153 .
- In src/styles/globals.css:41-115 mancano --background , --foreground , ecc.; sono presenti solo variabili --color-* .
- I tokens generati ( src/lib/tokens.ts:5-16 ) non includono le variabili base di tema e gli stati light/dark.
- Il tema viene gestito da Layout e da ThemeInjector , ma senza le variabili CSS corrette l’UI risulta “chiara”.
Ambito

- Aggiornare l’estrattore/generatore per produrre:
  - Mappa token TS per uso in codice ( tokens.ts ).
  - Blocco CSS con variabili in :root (light) e .dark (dark) compatibili con Tailwind.
  - Allineamento della chiave di storage ( theme ) tra ThemeProvider e sistema ( src/react/providers/themeProvider.tsx:23-46 ).
Requisiti Funzionali

- Tema scuro di default all’avvio (assenza di preferenza → dark).
- Disponibilità di variabili CSS: --background , --foreground , --primary , --primary-foreground , --secondary , --muted , --accent , --border , --input , --ring , --card , --popover , più eventuali --sidebar-* e --chart-* .
- Generatore legge i JSON in src/migration/design-system/tokens/*.json e crea output coerente.
- Supporto a doppia tavola: light e dark .
- Backward-compatibilità: continuare ad esportare designTokens per uso programmatico.
Requisiti Tecnici

- Input JSON unificato:
  - colors.json contiene light e dark per i token di tema base (chiavi come background , foreground , primary , ecc.) e opzionali brand ( primary-color , accent-color , ecc.).
  - typography.json definisce font famiglie e dimensioni.
  - spacing.json definisce scala spacing.
- Output:
  - src/lib/tokens.ts con oggetti colors , typography , spacing e utilità getColor , getSpacing .
  - Patch testata di src/styles/globals.css aggiungendo blocchi @layer base { :root { … } .dark { … } } con le variabili richieste.
- Allineare ThemeProvider a usare storageKey: 'theme' e default 'dark' ( src/react/providers/themeProvider.tsx:23-46 ).
Mappatura Token → CSS/Tailwind

- CSS:
  - :root usa i valori light .
  - .dark usa i valori dark .
- Tailwind ( tailwind.config.ts:31-76 ):
  - background: hsl(var(--background))
  - foreground: hsl(var(--foreground))
  - primary.DEFAULT: hsl(var(--primary)) , primary.foreground: hsl(var(--primary-foreground))
  - Stessa logica per secondary , muted , accent , card , popover , ring , border , input .
- Brand tokens ( --color-* ) restano disponibili; il generatore aggiunge anche le variabili di tema non prefissate.
Pipeline di Generazione

- Step 1: Caricare colors.json , spacing.json , typography.json .
- Step 2: Validare schema (light/dark presenti per chiavi di tema base).
- Step 3: Generare src/lib/tokens.ts :
  - Popolare colors con brand e includere mappa theme separata (light/dark) se utile.
  - Esportare utilità non invasive.
- Step 4: Aggiornare/inserire blocchi in src/styles/globals.css :
  - Scrivere/aggiornare :root e .dark .
  - Non rimuovere contenuti esistenti, fondere le sezioni preservando ordini e duplicati controllati.
- Step 5: Allineare ThemeProvider a storageKey = 'theme' e default 'dark' .
- Step 6: Verifica: avvia, apri /build/welcome e /tokens , toggle tema da Welcome e da ThemeToggle , controlla che bg-background sia scuro.
Modifiche Puntuali

- src/lib/tokens.ts : aggiungere chiavi mancanti e, se presente, sezione theme con light / dark .
- src/styles/globals.css : aggiungere i blocchi :root e .dark con le variabili base di tema.
- tailwind.config.ts:31-76 : lasciare mappatura su --background / --foreground e altre variabili di tema; mantenere i --color-* per compatibilità.
- src/react/providers/themeProvider.tsx:23-46 : impostare defaultTheme = 'dark' e storageKey = 'theme' .
API/CLI

- Comando di generazione (esempio): node scripts/generate-tokens.mjs
  - Opzioni:
    - --input-dir src/migration/design-system/tokens
    - --write-ts src/lib/tokens.ts
    - --patch-css src/styles/globals.css
    - --default-theme dark
Fallback e Compatibilità

- Se manca una chiave nel JSON, loggare warning e usare fallback:
  - --background : 0 0% 3.9% (scuro)
  - --foreground : 0 0% 98%
- Non interrompere build; generatore deve essere idempotente.
Test e Validazione

- Visual:
  - Aprire /build/welcome : verificare background scuro e testo chiaro.
  - Aprire /tokens per ispezione palette e spacing.
- Programmatico:
  - Test di utilità in src/react/lib/__tests__/themeInjector.test.ts e src/store/__tests__/store.test.ts per assicurare coerenza di evento theme-change .
- CSS:
  - Verificare presenza di --background / --foreground in runtime usando DevTools.
- Lint/Typecheck:
  - npm run lint , npm run typecheck , npm run test o npm run test:unit se presenti.
Criteri di Accettazione

- Tema scuro di default su V3.
- Toggle tema aggiorna correttamente classi e variabili ( Layout.astro:69-115 reagisce agli eventi).
- Classi Tailwind legate al tema funzionano ( bg-background , text-foreground , border-border ).
- Nessuna regressione sui brand tokens --color-* .
Rollout

- Eseguire generatore, commit dei file aggiornati, deploy.
- Monitorare errori console relativi a theme e variabili CSS.
Rischi

- Sovrascrittura accidentale di personalizzazioni in globals.css : mitigare con patch “merge” e backup automatici.
- Disallineamento tra chiave di storage del tema: risolto impostando storageKey = 'theme' ovunque.
Deliverables

- Estrattore aggiornato e ri-esecuzione sui JSON attuali.
- src/lib/tokens.ts e src/styles/globals.css allineati.
- Tema scuro di default verificato su welcome e tokens .