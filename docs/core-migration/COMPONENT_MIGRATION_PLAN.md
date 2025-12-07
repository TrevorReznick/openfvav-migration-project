Component Migration Plan

- Sorgente
  
  - /astroflux-V4/src
- Report Attuale
  
  - Pagine:
    - Index → src/pages/Index.tsx
    - spa-app → src/App.tsx (root SPA, neutro/router)
    - spa-main → src/main.tsx (bootstrap createRoot )
  - Componenti:
    - Navbar.tsx
    - SimpleNavbar.tsx
    - ThemeToggle.tsx
Destinazione

- Root
  
  - /openfav-codebase-V0/src/react/components/new-index
- Struttura proposta
  
  - Pagine (mappate 1:1 con migrated.pages ):
    - new-index/pages/Index.tsx ← da src/pages/Index.tsx
    - new-index/app/App.tsx ← da src/App.tsx (opzionale)
    - new-index/bootstrap/main.tsx (opzionale, solo se vuoi migrare il bootstrap)
  - Componenti UI (da migrated.components ):
    - new-index/components/Navbar.tsx
    - new-index/components/SimpleNavbar.tsx
    - new-index/components/ThemeToggle.tsx
- Variante alternativa
  
  - new-index/pages/Index/index.tsx
  - new-index/components/ui/Navbar.tsx , ecc.
- Scelta richiesta
  
  - A. Replica quasi 1:1 la struttura V4 ( pages/ , components/ sotto new-index )
  - B. Adatta allo stile V6 ( pages/Index/index.tsx + components/ui/... )
Implementazione Tool (Dry‑Run)

- Funzione
  - migrateIndexHierarchy(config, { dryRun })
- Letture
  - migration-report.json (già presente)
  - config.paths.v4 , config.paths.v6
- Calcoli
  - destRoot = join(config.paths.v6, 'src/react/components/new-index')
- Mapping
  - Per ogni voce in report.migrated.pages :
    - costruisce sourceFile dal path assoluto del report
    - costruisce destFile secondo la strategia (A o B)
  - Per report.migrated.components :
    - copia/mappa in destRoot/components...
- Dry‑run output
  - Stampa mapping “da → a”
  - Eventuali trasformazioni import (con componentMap se si aggiornano gli alias)
CLI

- Comando
  - components:migrate-index o components:migrate-hierarchical
- Opzioni
  - --dry-run (default true in fase di sperimentazione)
- Flusso
  - legge config con loadConfig
  - legge migration-report.json
  - chiama migrateIndexHierarchy(config, { dryRun: opts.dryRun })
  - stampa un report di ciò che verrebbe creato sotto new-index
Esecuzione

- Dry‑run prima, reale dopo:
  - node src/cli.js components:migrate-index --dry-run
  - Oppure via npm script dedicato
  - Se il mapping convince, rimuovere --dry-run per creare i file
Conferme richieste

- Scelta struttura destinazione (A o B, o variante tua)
- Ignorare sempre main.tsx nella migrazione gerarchica e trattare App.tsx solo come wrapper opzionale?
Passi successivi

- Implementare la nuova funzione di migrazione gerarchica
- Aggiungere comando CLI e script npm
- Eseguire dry‑run e mostrare il log di ciò che verrebbe creato sotto new-index