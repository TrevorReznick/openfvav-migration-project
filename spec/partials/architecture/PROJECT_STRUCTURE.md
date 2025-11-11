# 📁 Struttura Progetto Migration Unified

## Directory Tree

```
migration-unified/
├── 📄 package.json                    # Configurazione npm e script
├── 📄 README.md                       # Documentazione principale
├── 📄 PLAN.md                         # Piano completo del progetto
├── 📄 SUMMARY.md                      # Riepilogo stato progetto
├── 📄 PROJECT_STRUCTURE.md            # Questo file
├── 📄 migration.config.json.example   # Esempio configurazione
├── 📄 .gitignore                      # File da ignorare
│
├── 📂 src/                            # Codice sorgente principale
│   ├── 📄 cli.js                      # CLI principale (✅ Implementato base)
│   │
│   ├── 📂 config/                     # Gestione configurazione
│   │   ├── 📄 loader.js              # Caricamento config (TODO)
│   │   ├── 📄 validator.js           # Validazione config (TODO)
│   │   └── 📄 wizard.js               # Config wizard (TODO)
│   │
│   ├── 📂 tokens/                     # Migrazione design tokens
│   │   ├── 📄 migrate-tokens.js       # Migrazione principale (TODO)
│   │   │
│   │   ├── 📂 extractors/             # Estrattori token
│   │   │   ├── 📄 css-extractor.js    # Estrazione CSS vars (TODO)
│   │   │   ├── 📄 scss-extractor.js   # Estrazione SCSS vars (TODO)
│   │   │   └── 📄 json-extractor.js   # Estrazione JSON (TODO)
│   │   │
│   │   ├── 📂 generators/             # Generatori file token
│   │   │   ├── 📄 json-generator.js   # Genera JSON (TODO)
│   │   │   ├── 📄 js-generator.js     # Genera JS (TODO)
│   │   │   └── 📄 index-generator.js  # Genera index.js (TODO)
│   │   │
│   │   └── 📂 mappers/                 # Mapping token
│   │       └── 📄 token-mapper.js     # Applica mapping (TODO)
│   │
│   ├── 📂 components/                 # Migrazione componenti
│   │   ├── 📄 migrate-components.js   # Migrazione principale (TODO)
│   │   │
│   │   ├── 📂 transformers/            # Trasformatori componenti
│   │   │   ├── 📄 import-transformer.js    # Trasforma import (TODO)
│   │   │   ├── 📄 class-transformer.js     # Trasforma classi (TODO)
│   │   │   └── 📄 prop-transformer.js      # Trasforma props (TODO)
│   │   │
│   │   └── 📂 validators/               # Validatori componenti
│   │       └── 📄 component-validator.js   # Valida componenti (TODO)
│   │
│   ├── 📂 utils/                       # Utility functions
│   │   ├── 📄 file-utils.js           # Utility file system (TODO)
│   │   ├── 📄 path-utils.js           # Utility path (TODO)
│   │   ├── 📄 logger.js                # Logging (TODO)
│   │   ├── 📄 backup.js                # Backup/restore (TODO)
│   │   └── 📄 reporter.js              # Report generazione (TODO)
│   │
│   └── 📂 validators/                  # Validatori
│       └── 📄 validate-paths.js        # Validazione path (TODO)
│
├── 📂 scripts/                         # Script utility
│   ├── 📄 apply-tokens.js             # Applica token ai file (TODO)
│   └── 📄 update-imports.js            # Aggiorna import (TODO)
│
├── 📂 analyzers/                       # Analizzatori
│   ├── 📄 tailwind-analyzer.js         # Analizza Tailwind (TODO)
│   └── 📄 component-analyzer.js       # Analizza componenti (TODO)
│
├── 📂 api/                             # API Express
│   ├── 📄 server.js                   # Server Express (TODO)
│   │
│   ├── 📂 routes/                      # Route API
│   │   ├── 📄 tokens.js                # Route token (TODO)
│   │   ├── 📄 components.js            # Route componenti (TODO)
│   │   └── 📄 analysis.js              # Route analisi (TODO)
│   │
│   └── 📂 public/                      # File pubblici
│       ├── 📄 index.html               # Dashboard (TODO)
│       └── 📄 app.js                   # Client app (TODO)
│
└── 📂 tests/                           # Test
    ├── 📂 unit/                        # Unit test
    ├── 📂 integration/                 # Integration test
    └── 📂 fixtures/                    # Test fixtures
```

## 📊 Stato Implementazione

### ✅ Completato
- [x] Struttura directory base
- [x] Package.json con dipendenze
- [x] README.md
- [x] PLAN.md
- [x] Config example
- [x] CLI base (skeleton)

### 🚧 In Lavoro
- [ ] Config loader
- [ ] Config validator
- [ ] Token extractors
- [ ] Token generators

### 📋 TODO
- [ ] Component migrator
- [ ] Apply-tokens script
- [ ] API Express
- [ ] Analyzers
- [ ] Tests
- [ ] Documentation completa

## 🎯 Priorità Implementazione

### Fase 1: Foundation (Alta Priorità)
1. Config loader e validator
2. Path utilities
3. Logger base
4. File utilities

### Fase 2: Token Migration (Alta Priorità)
1. CSS extractor
2. SCSS extractor
3. Token mapper
4. JSON/JS generators
5. Index generator

### Fase 3: Component Migration (Media Priorità)
1. Component migrator base
2. Import transformer
3. Class transformer

### Fase 4: Utilities (Media Priorità)
1. Apply-tokens script
2. Backup/restore
3. Reporter

### Fase 5: Analysis & API (Bassa Priorità)
1. Tailwind analyzer
2. API Express
3. Dashboard

## 📝 Note

- Tutti i file sono marcati come TODO fino a quando non implementati
- La struttura è pronta per l'implementazione incrementale
- Ogni modulo può essere sviluppato indipendentemente
- I test possono essere aggiunti man mano che i moduli vengono implementati

## 🔄 Prossimi Passi

1. Implementare config loader
2. Implementare CSS extractor
3. Implementare token mapper
4. Implementare JSON generator
5. Testare flusso completo token migration

