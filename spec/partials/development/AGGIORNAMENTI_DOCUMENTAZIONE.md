/Users/default/Sviluppo/nodejs/projects/openfav-migration/migration-dev-V0/spec/partials/development/AGGIORNAMENTI_DOCUMENTAZIONE.md
# Aggiornamenti Documentazione — Novembre 2025

## Sintesi
- Focus su consolidamento del flusso di migrazione (CLI e Web), sicurezza e deployment su host.
- Allineamento del PRD alla versione 2.0 con stato avanzamento e roadmap dettagliata.
- Rafforzata la guida di conversione colori (HEX/RGBA → HSL) con esempi e supporto dark mode.
- Specificata la necessità di override dei path nel CLI per integrazione con l’interfaccia web.
- Documentata la mappatura degli stili da Astroflux-V4 a Openfav-Dev con esempi concreti.

## Dettagli per file
- `spec/PRD.md`
  - Versione 2.0, stato: 35% in sviluppo; obiettivi di unificazione, automazione e flessibilità.
  - Architettura del progetto (moduli `config`, `tokens`, `components`, `utils`, `validators`, `api`).
  - Flusso completo di migrazione e nuove funzionalità (config wizard, backup/restore, report).
  - Endpoints dell’interfaccia web e modifiche CLI necessarie (`--source`, `--destination`, override in `loadConfig`).
  - Piano di implementazione per fasi e metriche qualità.

- `spec/partials/architecture/DEPLOYMENT_HOST.md`
  - Compatibilità host e prerequisiti (Node >= 18, path assoluti).
  - Avvio API su host (PM2, systemd) e configurazione porta.
  - Reverse proxy Nginx e raccomandazioni di sicurezza (API key, rate limiting, HTTPS).
  - Esempi di validazione/limitazione dei path lato server.

- `spec/partials/architecture/FLUSSO_MIGRAZIONE.md`
  - Flusso CLI: setup con file di config o path diretti.
  - Comandi supportati: `tokens`, `colors`, `typography`, `components`, `all` con `--dry-run`, `--verbose`, override path.
  - Dettagli operativi per ciascun comando (estrazione, conversione, generazione).
  - Flusso Web: avvio server, form, validazione real-time, output.
  - Definizione e payload degli endpoint (`POST /run-script`, ecc.).

- `spec/partials/core-migration/COLOR_CONVERSION_GUIDE.md`
  - Obiettivi: adeguamento V4 → V6 con formato HSL compatibile Tailwind.
  - Mappatura standard colori e funzioni di conversione (HEX→HSL, RGBA string→HSL).
  - Gestione varianti e CSS generato; supporto dark mode.
  - Stralci di configurazione per integrazione in `tailwind.config`.

- `spec/partials/architecture/KIRO-SPEC.md`
  - Stato progetto (35%); funzionalità completate e TODO principali.
  - Struttura delle Kiro specs per feature; priorità di sviluppo.
  - Architettura moduli (`src/cli.js`, `tokens`, `components`, `utils`, `validators`) e configurazione `migration.config.json`.

- `spec/partials/core-migration/MAPPATURA_STILI.md`
  - Mappatura dettagliata di colori (primary, secondary, accent, page) con conversioni HEX→HSL e RGBA→HSL.
  - Esempi concreti di target CSS (`:root`, `tailwind.config.ts`) e variabili/varianti.
  - Note su spacing e component classes.

- `spec/partials/strategy-planning/ANALISI_FATTIBILITA.md`
  - Confronto Tailwind tra Astroflux-V4 e Openfav-Dev (design tokens vs valori hardcoded).
  - Differenze di formato colore e implicazioni di migrazione (conversione e mapping RGBA).
  - Struttura dei CSS globali e compatibilità/differenze (dark mode, layer, custom properties).

- `spec/partials/architecture/API_WEB_INTERFACE.md`
  - Prerequisiti e avvio API locale.
  - Funzionalità UI (selezione tipo migrazione, path, validazione, output).
  - Modifiche richieste al CLI: aggiunta delle opzioni `--source` e `--destination` e override in `loadConfig`.
  - Endpoint e payload di richiesta/risposta; note di sicurezza.

## Implicazioni operative
- CLI: allineare `src/cli.js` per supportare override dei path e `--dry-run`, `--verbose` in tutti i comandi.
- API: assicurare sicurezza base (API key, path whitelist) e opzioni di binding (`0.0.0.0`) per accesso remoto controllato.
- Token: consolidare output HSL e variabili CSS coerenti con le mappature documentate.
- Web: validazione path in tempo reale e feedback utente unificato con gli endpoint definiti.

## Prossimi passi
- Aggiornare `CLI_MODIFICATIONS.md` con esempio definitivo di `loadConfig(options)` e propagazione opzioni in ogni comando.
- Integrare test unitari per le funzioni di conversione colore e per l’estrazione token.
- Aggiungere esempi di `migration.config.json` per scenari multi-source e fallback V3.