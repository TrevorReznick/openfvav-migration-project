# 🚀 Piano Progetto: Migration Unified

## 📋 Obiettivo

Creare un **tool di migrazione unificato** che combini le migliori caratteristiche di migration-v0, migration-v1/v2, e migration-v3 per offrire la soluzione più completa ed efficace per migrare OpenFav da V3/V4 a V6.

---

## 🎯 Caratteristiche Principali

### ✅ Dal migration-v1/v2 (MIGLIORE per token)
- **Estrazione automatica token** da file CSS/SCSS sorgente
- **Parsing CSS variables** (`--primary: value`)
- **Parsing SCSS variables** (`$color-primary: value`)
- **Mapping automatico** con fallback V3 → V4
- **Supporto multi-source** (multiple file sorgente)

### ✅ Dal migration-v0 (Tool completo)
- **API Express** per analisi interattiva
- **Tailwind analyzer** per analisi classi utility
- **Script apply-tokens.js** completo per applicare token ai file
- **Struttura modulare** ben organizzata

### ✅ Dal migration-v3 (Struttura pulita)
- **Scrittura diretta in path target** (non directory corrente)
- **Supporto completo token dimensionali** (spacing, padding, margin, borderRadius, borderWidth)
- **Supporto lineHeight** in typography
- **Dry-run mode** completo
- **Generazione index.js** per import

### ✨ Nuove Caratteristiche
- **Validazione avanzata** dei path e file sorgente
- **Report dettagliato** della migrazione
- **Backup automatico** prima della migrazione
- **Rollback** in caso di errori
- **Progress tracking** per migrazioni lunghe
- **Config wizard** interattivo per setup iniziale

---

## 📁 Struttura Progetto Proposta

```
migration-unified/
├── package.json
├── README.md
├── migration.config.json.example
├── .gitignore
│
├── src/
│   ├── cli.js                    # CLI principale (da v0/v3, migliorato)
│   ├── config/
│   │   ├── loader.js             # Caricamento e validazione config
│   │   ├── validator.js          # Validazione configurazione
│   │   └── wizard.js             # Config wizard interattivo (NUOVO)
│   │
│   ├── tokens/
│   │   ├── migrate-tokens.js     # Migrazione token principale
│   │   ├── extractors/
│   │   │   ├── css-extractor.js  # Estrazione CSS variables (da v1/v2)
│   │   │   ├── scss-extractor.js # Estrazione SCSS variables (da v1/v2)
│   │   │   └── json-extractor.js # Estrazione JSON (NUOVO)
│   │   ├── generators/
│   │   │   ├── json-generator.js # Genera file JSON (da v0/v3)
│   │   │   ├── js-generator.js   # Genera file JS (da v1/v2)
│   │   │   └── index-generator.js # Genera index.js (da v0/v3)
│   │   └── mappers/
│   │       └── token-mapper.js   # Applica mapping (da v1/v2)
│   │
│   ├── components/
│   │   ├── migrate-components.js # Migrazione componenti (da v0/v3)
│   │   ├── transformers/
│   │   │   ├── import-transformer.js
│   │   │   ├── class-transformer.js
│   │   │   └── prop-transformer.js
│   │   └── validators/
│   │       └── component-validator.js
│   │
│   ├── utils/
│   │   ├── file-utils.js         # Utility file system
│   │   ├── path-utils.js         # Utility path resolution
│   │   ├── logger.js             # Logging migliorato
│   │   ├── backup.js             # Backup/restore (NUOVO)
│   │   └── reporter.js           # Report generazione (NUOVO)
│   │
│   └── validators/
│       └── validate-paths.js     # Validazione path (da v0/v3)
│
├── scripts/
│   ├── apply-tokens.js           # Applica token ai file (da v0/v3, migliorato)
│   └── update-imports.js         # Aggiorna import (da v2, migliorato)
│
├── analyzers/
│   ├── tailwind-analyzer.js      # Analizzatore Tailwind (da v0)
│   └── component-analyzer.js    # Analizzatore componenti (NUOVO)
│
├── api/
│   ├── server.js                 # API Express (da v0)
│   ├── routes/
│   │   ├── tokens.js
│   │   ├── components.js
│   │   └── analysis.js
│   └── public/
│       ├── index.html
│       └── app.js
│
└── tests/
    ├── unit/
    ├── integration/
    └── fixtures/
```

---

## 🔧 Funzionalità Dettagliate

### 1. Migrazione Token (Core Feature)

**Approccio Ibrido:**
- **Prima**: Prova estrazione automatica da file sorgente (v1/v2)
- **Fallback**: Usa configurazione manuale se file non trovati (v0/v3)
- **Output**: Supporta sia JSON che JS (configurabile)

**Supporto Token:**
- ✅ Colors (estrazione automatica + config)
- ✅ Typography (con lineHeight)
- ✅ Spacing
- ✅ Padding
- ✅ Margin
- ✅ BorderRadius
- ✅ BorderWidth
- ✅ Shadows (NUOVO)
- ✅ Breakpoints (NUOVO)

**Formati Sorgente Supportati:**
- CSS variables (`--token: value`)
- SCSS variables (`$token: value`)
- JSON files
- Tailwind config
- CSS custom properties

### 2. Migrazione Componenti

**Caratteristiche:**
- Mapping configurabile componenti
- Trasformazione import automatica
- Trasformazione classi Tailwind
- Trasformazione props
- Validazione componenti migrati
- Supporto per sottocomponenti

### 3. Applicazione Token

**Script `apply-tokens.js` migliorato:**
- Trasforma classi Tailwind hardcoded
- Trasforma stili inline
- Supporta multiple estensioni file
- Report dettagliato modifiche
- Dry-run mode
- Backup automatico

### 4. API e Analisi

**API Express:**
- Endpoint per analisi token
- Endpoint per analisi componenti
- Endpoint per validazione
- Dashboard web interattiva

**Analizzatori:**
- Tailwind class analyzer
- Component dependency analyzer
- Token usage analyzer

### 5. Validazione e Sicurezza

**Validazione:**
- Path validation
- File existence check
- Config schema validation
- Token format validation
- Component structure validation

**Sicurezza:**
- Backup automatico prima migrazione
- Rollback in caso di errori
- Dry-run mode obbligatorio per produzione
- Logging dettagliato

---

## 📦 Dipendenze

```json
{
  "dependencies": {
    "chalk": "^5.0.1",
    "commander": "^14.0.0",
    "fs-extra": "^10.0.0",
    "glob": "^8.0.0",
    "inquirer": "^9.0.0",
    "postcss": "^8.4.0",
    "postcss-scss": "^4.0.0",
    "express": "^5.1.0",
    "cors": "^2.8.5",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/node": "^24.1.0",
    "typescript": "^5.8.3",
    "vitest": "^3.2.4",
    "npm-run-all": "^4.1.5",
    "rimraf": "^6.0.1"
  }
}
```

---

## 🎮 Comandi CLI

```bash
# Setup iniziale
npm run setup              # Config wizard interattivo

# Validazione
npm run validate           # Valida configurazione e path

# Migrazione Token
npm run migrate:tokens     # Migra tutti i token
npm run migrate:colors     # Migra solo colors
npm run migrate:typography # Migra solo typography
npm run migrate:spacing    # Migra solo spacing

# Migrazione Componenti
npm run migrate:components # Migra tutti i componenti
npm run migrate:component <name> # Migra singolo componente

# Applicazione
npm run apply-tokens       # Applica token ai file
npm run update-imports     # Aggiorna import

# Analisi
npm run analyze            # Analizza progetto
npm run analyze:tailwind   # Analizza classi Tailwind
npm run analyze:tokens     # Analizza uso token

# API
npm run api                # Avvia API server

# Utilità
npm run backup             # Crea backup
npm run restore <backup>   # Ripristina backup
npm run report             # Genera report migrazione

# Dry-run
npm run migrate:tokens --dry-run
npm run migrate:components --dry-run
```

---

## 📝 Configurazione Esempio

```json
{
  "version": "2.0",
  "workspaceRoot": "/path/to/workspace",
  "paths": {
    "v3": "/path/to/v3",
    "v4": "/path/to/v4",
    "v6": "/path/to/v6"
  },
  "options": {
    "createBackup": true,
    "dryRun": false,
    "verbose": true,
    "outputFormat": "js",
    "autoApplyTokens": false
  },
  "tokenMappings": {
    "colors": {
      "source": {
        "v4": [
          { "path": "{v4}/src/styles/globals.css", "type": "css" },
          { "path": "{v4}/src/styles/tokens.css", "type": "css" }
        ],
        "v3": [
          { "path": "{v3}/src/styles/variables.scss", "type": "scss" }
        ]
      },
      "primary": { "v4Name": "--primary", "v3Name": "$primary-color" },
      "secondary": { "v4Name": "--secondary", "v3Name": "$secondary-color" }
    },
    "typography": {
      "source": {
        "v4": [
          { "path": "{v4}/src/styles/typography.css", "type": "css" }
        ]
      },
      "fontFamily": {
        "sans": { "v4Name": "--font-sans" },
        "mono": { "v4Name": "--font-mono" }
      },
      "fontSize": {
        "base": { "v4Name": "--text-base" },
        "lg": { "v4Name": "--text-lg" }
      },
      "lineHeight": {
        "base": { "v4Name": "--leading-base" }
      }
    },
    "spacing": {
      "source": {
        "v4": [
          { "path": "{v4}/src/styles/spacing.css", "type": "css" }
        ]
      },
      "space": {
        "0": { "v4Name": "space-0" },
        "1": { "v4Name": "space-1" }
      }
    }
  },
  "componentMappings": {
    "button": {
      "v4Path": "{v4}/src/components/Button.tsx",
      "v6Path": "{v6}/src/react/components/ui/Button.tsx",
      "transformations": [
        {
          "type": "import",
          "from": "@/components/Button",
          "to": "@/components/ui/button"
        },
        {
          "type": "class",
          "from": "btn-primary",
          "to": "bg-primary"
        }
      ]
    }
  }
}
```

---

## 🚦 Roadmap Implementazione

### Fase 1: Foundation (Settimana 1)
- [ ] Setup progetto base
- [ ] Struttura directory
- [ ] Package.json e dipendenze
- [ ] Config loader e validator
- [ ] CLI base con commander

### Fase 2: Token Migration Core (Settimana 2)
- [ ] CSS extractor (da v1/v2)
- [ ] SCSS extractor (da v1/v2)
- [ ] Token mapper (da v1/v2)
- [ ] JSON generator (da v0/v3)
- [ ] JS generator (da v1/v2)
- [ ] Index generator (da v0/v3)
- [ ] Migrazione token principale

### Fase 3: Token Migration Advanced (Settimana 3)
- [ ] Supporto token dimensionali completi
- [ ] Supporto lineHeight
- [ ] Multi-source support
- [ ] Fallback V3 → V4
- [ ] Validazione token

### Fase 4: Component Migration (Settimana 4)
- [ ] Component migrator base (da v0/v3)
- [ ] Import transformer
- [ ] Class transformer
- [ ] Prop transformer
- [ ] Component validator

### Fase 5: Utilities (Settimana 5)
- [ ] Script apply-tokens migliorato
- [ ] Script update-imports
- [ ] Backup/restore system
- [ ] Reporter
- [ ] Logger migliorato

### Fase 6: Analysis & API (Settimana 6)
- [ ] Tailwind analyzer (da v0)
- [ ] Component analyzer
- [ ] API Express setup
- [ ] API routes
- [ ] Dashboard web

### Fase 7: Testing & Polish (Settimana 7)
- [ ] Unit tests
- [ ] Integration tests
- [ ] Documentation
- [ ] Examples
- [ ] Error handling migliorato

---

## 🎯 Obiettivi di Qualità

- ✅ **100% backward compatible** con config v1.0
- ✅ **Zero breaking changes** durante migrazione
- ✅ **Dry-run sempre disponibile**
- ✅ **Backup automatico** prima modifiche
- ✅ **Logging dettagliato** per debugging
- ✅ **Report completo** post-migrazione
- ✅ **Validazione completa** prima esecuzione
- ✅ **Error recovery** con rollback

---

## 📚 Documentazione

- README completo con esempi
- Guide per ogni tipo di migrazione
- API documentation
- Troubleshooting guide
- Best practices

---

## 🔄 Migrazione da Versioni Precedenti

Il nuovo tool sarà in grado di:
- Leggere config di v0, v1, v2, v3
- Migrare automaticamente alla nuova struttura
- Mantenere compatibilità con progetti esistenti

---

## ✨ Innovazioni Rispetto alle Versioni Precedenti

1. **Approccio Ibrido**: Estrazione automatica + config manuale
2. **Multi-format Support**: CSS, SCSS, JSON, Tailwind config
3. **Backup/Rollback**: Sicurezza integrata
4. **API Interattiva**: Dashboard web per analisi
5. **Config Wizard**: Setup guidato interattivo
6. **Progress Tracking**: Feedback durante migrazioni lunghe
7. **Report Dettagliato**: Analisi completa post-migrazione
8. **Validazione Avanzata**: Pre-flight checks completi

