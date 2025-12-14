# 📋 OpenFav Migration Tool - Guida Completa ai Comandi

> **Versione Tool**: 0.1 | **Ultimo aggiornamento**: Dicembre 2025 | **Node.js**: ≥ 18.0.0

---

## 📑 Indice

- [Installazione](#-installazione)
- [Quick Start](#-quick-start)
- [Setup e Configurazione](#-setup-e-configurazione)
- [Migrazione Token](#-migrazione-token)
- [Migrazione Componenti](#-migrazione-componenti)
- [Analisi](#-analisi)
- [Utility](#-utility)
- [API Server](#-api-server)
- [Testing](#-testing)
- [Workflow Consigliati](#-workflow-consigliati)
- [Configurazione Avanzata](#-configurazione-avanzata)
- [Troubleshooting](#-troubleshooting)
- [Best Practices](#-best-practices)

---

## 📦 Installazione

### Prerequisiti

| Requisito | Versione Minima | Comando Verifica |
|-----------|----------------|------------------|
| Node.js | 18.0.0 | `node --version` |
| npm | 8.0.0 | `npm --version` |
| Spazio disco | ~100MB | `df -h .` |

### Procedura

```bash
# 1. Clonare il repository
git clone [repository-url]
cd openfav-migration-unified

# 2. Installare le dipendenze
npm install

# 3. Verificare l'installazione
npm run validate

# 4. (Opzionale) Link globale per uso da qualsiasi directory
npm link
```

### Verifica Installazione

```bash
# Test rapido
node src/cli.js --version

# Test completo
npm test -- --bail
```

---

## ⚡ Quick Start

### Migrazione in 3 Passi

```bash
# 1️⃣ Setup interattivo (solo prima volta)
npm run setup

# 2️⃣ Migra tutti i token
npm run migrate:tokens

# 3️⃣ Genera report
npm run report
```

### Test Sicuro (Preview)

```bash
# Modifica config per dry-run
echo '{"options": {"dryRun": true}}' > migration.config.json

# Esegui migrazione (solo preview)
npm run migrate:tokens

# Controlla il log per vedere cosa cambierebbe
```

---

## 🔧 Setup e Configurazione

### Comandi Base

```bash
# 🎯 Setup interattivo guidato
npm run setup
# ├─ Configura path sorgente/destinazione
# ├─ Selezione features da migrare
# └─ Validazione automatica

# ✅ Valida configurazione esistente
npm run validate
# ├─ Controlla sintassi JSON
# ├─ Verifica esistenza path
# └─ Valida mappature token
```

### Configurazione Manuale

```bash
# Crea config da template
cp migration.config.json.example migration.config.json

# Modifica con il tuo editor preferito
nano migration.config.json
# oppure
code migration.config.json
```

### Template Configurazione Minima

```json
{
  "version": "2.0",
  "workspaceRoot": "/Users/your-user/projects",
  "paths": {
    "v4": "{{workspaceRoot}}/astroflux-V4",
    "v6": "{{workspaceRoot}}/openfav-codebase-V0"
  },
  "options": {
    "createBackup": true,
    "dryRun": false,
    "verbose": true
  }
}
```

**💡 Tip**: Usa `{{workspaceRoot}}` per path relativi alla workspace root.

---

## 🎨 Migrazione Token

### Overview

Il sistema di migrazione token supporta:
- ✅ Estrazione automatica da CSS/SCSS
- ✅ Conversione formati (HEX → HSL, RGBA → HSL)
- ✅ Mapping intelligente con fallback Shadcn/ui
- ✅ Generazione TypeScript types
- ✅ Aggiornamento configurazione Tailwind

### Comandi Principali

#### Migrazione Completa

```bash
# 🚀 Migra TUTTI i token (colori, typography, spacing)
npm run migrate:tokens

# 📊 Output:
# ├─ src/lib/tokens.ts (TypeScript)
# ├─ src/styles/globals.css (CSS Variables)
# └─ tailwind.config.ts (Tailwind Config)
```

#### Migrazione Standalone

```bash
# 🔄 Migrazione indipendente (no config file)
npm run migrate:tokens:standalone

# Usa path hardcoded per test rapidi
```

### Comandi Specifici per Categoria

```bash
# 🎨 Solo colori
npm run migrate:colors
# ├─ Estrae da: *.css, *.scss
# ├─ Converte: HEX/RGBA → HSL
# └─ Genera: 31 colori Shadcn/ui standard

# 📝 Solo tipografia
npm run migrate:typography
# ├─ Font families
# ├─ Font sizes
# ├─ Line heights
# └─ Font weights

# 📏 Solo spacing
npm run migrate:spacing
# ├─ Padding
# ├─ Margin
# ├─ Gap
# └─ Space utilities
```

### Opzioni Avanzate

```bash
# 🧪 Dry-run (preview senza modifiche)
# Modifica config: "dryRun": true
npm run migrate:tokens

# 📢 Verbose output (debug dettagliato)
# Modifica config: "verbose": true
npm run migrate:tokens

# 🔍 Con analisi pre-migrazione
npm run analyze:tokens && npm run migrate:tokens
```

### Esempi Pratici

#### Scenario 1: Migrazione Pulita (Prima Volta)

```bash
# Setup
npm run setup

# Backup
npm run backup

# Migrazione
npm run migrate:tokens

# Verifica
npm run analyze:tokens
```

#### Scenario 2: Aggiornamento Colori

```bash
# Solo colori (più veloce)
npm run migrate:colors

# Verifica differenze
git diff src/lib/tokens.ts
```

#### Scenario 3: Test Sicuro

```bash
# 1. Abilita dry-run in config
sed -i 's/"dryRun": false/"dryRun": true/' migration.config.json

# 2. Esegui migrazione
npm run migrate:tokens

# 3. Controlla log
tail -f migration.log

# 4. Disabilita dry-run per esecuzione reale
sed -i 's/"dryRun": true/"dryRun": false/' migration.config.json
```

### Struttura Output

```typescript
// src/lib/tokens.ts
export const colors = {
  background: '222 47% 11%',
  foreground: '0 0% 100%',
  primary: '262 83% 58%',
  // ... 31 colori Shadcn/ui
} as const;

export type ColorToken = keyof typeof colors;
export const getColor = (key: ColorToken) => `var(--color-${key})`;
```

```css
/* src/styles/globals.css */
@layer base {
  :root {
    --background: 222 47% 11%;
    --foreground: 0 0% 100%;
    --primary: 262 83% 58%;
    /* ... tutte le variabili Shadcn/ui */
  }
}
```

---

## 🧩 Migrazione Componenti

### Overview

Migra componenti React da V4 a V6 con:
- ✅ Trasformazione import
- ✅ Conversione classi CSS → Tailwind
- ✅ Aggiornamento props
- ✅ Refactoring pattern obsoleti

### Comandi

```bash
# 🧩 Migra tutti i componenti
npm run migrate:components
# ├─ Analizza dipendenze
# ├─ Trasforma import
# ├─ Converte classi
# └─ Aggiorna props

# 🔍 Analisi pre-migrazione (consigliato)
npm run migrate:components:analyze
# ├─ Lista componenti da migrare
# ├─ Identifica dipendenze
# ├─ Rileva pattern obsoleti
# └─ Stima complessità
```

### Workflow Consigliato

```bash
# 1. Analizza componenti
npm run migrate:components:analyze > components-report.txt

# 2. Rivedi report
cat components-report.txt

# 3. Backup
npm run backup

# 4. Migra
npm run migrate:components

# 5. Test
npm run test

# 6. Verifica manuale
git diff src/react/components/
```

### Cosa Viene Migrato

| Aspetto | Prima (V4) | Dopo (V6) |
|---------|-----------|----------|
| **Import** | `@/components/Button` | `@/components/ui/button` |
| **Classi** | `btn-primary` | `bg-primary text-primary-foreground` |
| **Props** | `variant="primary"` | `variant="default"` |
| **Pattern** | Class components | Functional + Hooks |

---

## 🔍 Analisi

### Comandi Disponibili

```bash
# 📊 Analisi completa del progetto
npm run analyze
# ├─ Token usage
# ├─ Component dependencies
# ├─ Tailwind classes
# └─ Import map

# 🎨 Analizza utilizzo token
npm run analyze:tokens
# ├─ Token definiti vs utilizzati
# ├─ Token obsoleti
# └─ Coverage report

# 🧩 Analizza componenti React
npm run analyze:components
# ├─ Dependency tree
# ├─ Props usage
# └─ Pattern detection

# 🎨 Analizza classi Tailwind CSS
npm run analyze:tailwind
# ├─ Classi utilizzate
# ├─ Classi custom
# └─ Coverage utility
```

### Output Esempio

```bash
$ npm run analyze:tokens

🔍 Token Analysis Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Summary
  Total Tokens:     31
  Used:            28 (90%)
  Unused:           3 (10%)
  
🎨 Colors
  ✅ primary         (42 occurrences)
  ✅ secondary       (18 occurrences)
  ⚠️  destructive    (0 occurrences) - Unused
  
📝 Typography
  ✅ font-sans       (15 occurrences)
  ✅ font-mono       (7 occurrences)
  
📏 Spacing
  ✅ space-4         (89 occurrences)
  ⚠️  space-12       (0 occurrences) - Unused

💡 Recommendations
  - Remove unused tokens: destructive, space-12
  - Consider extracting repeated patterns
```

### Analisi Personalizzata

```bash
# Analizza file specifici
npm run analyze:components -- --path="src/react/components/ui"

# Output in formato JSON
npm run analyze:tokens -- --format=json > tokens-analysis.json

# Con filtri
npm run analyze:tailwind -- --unused-only
```

---

## 🛠️ Utility

### Backup e Restore

```bash
# 💾 Crea backup timestampato
npm run backup
# Output: backups/backup-2025-12-14-10-30-45/

# 🔄 Ripristina da backup (interattivo)
npm run restore
# ├─ Lista backup disponibili
# ├─ Selezione backup
# └─ Conferma ripristino

# Restore specifico
npm run restore -- --backup="backup-2025-12-14-10-30-45"
```

### Applicazione Token

```bash
# 🎨 Applica token ai file esistenti
npm run apply-tokens
# ├─ Scansiona file React/TSX
# ├─ Sostituisce valori hardcoded
# ├─ Usa token definiti
# └─ Preserva formattazione

# Esempio trasformazione:
# Prima:  <div style={{ color: '#7C3AED' }}>
# Dopo:   <div className="text-primary">
```

### Aggiornamento Import

```bash
# 📦 Aggiorna import nei componenti
npm run update-imports
# ├─ Rileva import obsoleti
# ├─ Sostituisce con nuovi path
# └─ Risolve conflitti

# Esempio:
# Prima:  import { Button } from '@/components/Button'
# Dopo:   import { Button } from '@/components/ui/button'
```

### Report

```bash
# 📋 Genera report dettagliato migrazione
npm run report
# Output: reports/migration-report-2025-12-14.md

# Report include:
# ├─ Riepilogo modifiche
# ├─ File modificati
# ├─ Token migrati
# ├─ Componenti aggiornati
# ├─ Warnings
# └─ Next steps
```

---

## 🌐 API Server

### Avvio Server

```bash
# 🚀 Avvia server Express
npm run api

# Output:
# ✓ Server running on http://localhost:3000
# ✓ API endpoints ready
```

### Configurazione Porta

```bash
# Metodo 1: Variabile d'ambiente
PORT=3001 npm run api

# Metodo 2: File .env
echo "PORT=3001" > .env
npm run api

# Metodo 3: Config file
# migration.config.json
{
  "api": {
    "port": 3001,
    "host": "0.0.0.0"
  }
}
```

### Endpoint Disponibili

#### 📊 Info e Stato

```bash
# GET /info - Informazioni server
curl http://localhost:3000/info

# Response:
{
  "name": "openfav-migration-unified",
  "version": "0.1",
  "status": "ready",
  "uptime": 3600
}
```

#### 📋 Lista Comandi

```bash
# GET /commands - Comandi disponibili
curl http://localhost:3000/commands

# Response:
{
  "commands": [
    "migrate:tokens",
    "migrate:components",
    "analyze",
    ...
  ]
}
```

#### ✅ Validazione Path

```bash
# POST /validate-paths - Valida path forniti
curl -X POST http://localhost:3000/validate-paths \
  -H "Content-Type: application/json" \
  -d '{
    "source": "/path/to/source",
    "destination": "/path/to/dest"
  }'

# Response:
{
  "valid": true,
  "source": {
    "exists": true,
    "readable": true
  },
  "destination": {
    "exists": true,
    "writable": true
  }
}
```

#### 🚀 Esecuzione Script

```bash
# POST /run-script - Esegue script di migrazione
curl -X POST http://localhost:3000/run-script \
  -H "Content-Type: application/json" \
  -d '{
    "command": "migrate:tokens",
    "options": {
      "dryRun": false,
      "verbose": true
    }
  }'

# Response (streaming):
{
  "status": "running",
  "output": "Migrating tokens...\n✓ Colors extracted\n...",
  "progress": 45
}
```

### Dashboard Web

Accedi a `http://localhost:3000` per la dashboard interattiva:

- 📊 Stato migrazione in tempo reale
- 🎛️ Esecuzione comandi GUI
- 📈 Grafici utilizzo token
- 🔍 Browser file generati

---

## 🧪 Testing

### Jest (Test Suite Principale)

```bash
# 🧪 Esegui tutti i test
npm test

# 👀 Watch mode (ricarica automatica)
npm run test:watch

# 📊 Coverage report
npm run test:coverage
# Output: coverage/lcov-report/index.html
```

### Vitest (Alternative Runner)

```bash
# ⚡ Esegui test con Vitest (più veloce)
npm run test:vitest

# 👀 Watch mode Vitest
npm run test:vitest:watch

# 📊 Coverage Vitest
npm run test:vitest:coverage
```

### Test Specifici

```bash
# Test singolo file
npm test -- src/tokens/extractors/css-extractor.test.js

# Test con pattern
npm test -- --testPathPattern=token

# Test con bail (ferma al primo errore)
npm test -- --bail

# Test verbose
npm test -- --verbose
```

### Test Manuali

```bash
# Test estrazione colori
node -e "
  import('./src/tokens/extractors/css-extractor.js')
    .then(m => m.extractColors('../astroflux-V4/src/index.css'))
    .then(console.log)
"

# Test conversione HSL
node -e "
  import('./src/tokens/converters/color-converter.js')
    .then(m => console.log(m.hexToHSL('#7C3AED')))
"

# Test generatore completo
node src/tokens/generate-tokens-ts-fixed.js
```

### Coverage Goals

| Categoria | Target | Attuale |
|-----------|--------|---------|
| Statements | 80% | TBD |
| Branches | 75% | TBD |
| Functions | 80% | TBD |
| Lines | 80% | TBD |

---

## 📊 Workflow Consigliati

### 🎯 Workflow 1: Prima Migrazione Completa

**Tempo stimato**: ~15 minuti

```bash
# Fase 1: Preparazione (2 min)
npm run setup                    # Setup interattivo
npm run validate                 # Valida config
npm run backup                   # Backup sicurezza

# Fase 2: Analisi (3 min)
npm run analyze                  # Analisi completa
npm run analyze:tokens           # Focus sui token
npm run analyze:components       # Focus sui componenti

# Fase 3: Migrazione Token (5 min)
npm run migrate:tokens           # Migra tutti i token
npm run analyze:tokens           # Verifica risultati

# Fase 4: Migrazione Componenti (5 min)
npm run migrate:components       # Migra componenti
npm run test                     # Esegui test

# Fase 5: Finalizzazione (2 min)
npm run report                   # Genera report
git diff                         # Rivedi modifiche
git add . && git commit -m "feat: complete migration"
```

### 🔄 Workflow 2: Sviluppo Iterativo

**Per modifiche incrementali**

```bash
# Loop di sviluppo rapido
while true; do
  # 1. Modifica codice
  code src/tokens/generate-tokens-ts-fixed.js
  
  # 2. Test immediato
  node src/tokens/generate-tokens-ts-fixed.js
  
  # 3. Verifica output
  npm run analyze:tokens
  
  # 4. Se OK, esci dal loop
  read -p "Continua? (y/n) " -n 1 -r
  echo
  [[ ! $REPLY =~ ^[Yy]$ ]] && break
done

# Commit finale
git add . && git commit -m "refactor: improve token generation"
```

### 🎨 Workflow 3: Solo Aggiornamento Colori

**Quando cambiano solo i colori**

```bash
# Quick color update (2 min)
npm run backup                   # Backup preventivo
npm run migrate:colors           # Solo colori
git diff src/lib/tokens.ts       # Verifica modifiche
npm run test                     # Test rapido
```

### 🧪 Workflow 4: Test Sicuro (Dry-Run)

**Prima di modifiche importanti**

```bash
# Configurazione dry-run
cat > migration.config.json <<EOF
{
  "options": {
    "dryRun": true,
    "verbose": true,
    "createBackup": false
  }
}
EOF

# Esegui in modalità preview
npm run migrate:tokens

# Analizza output
less migration.log

# Se OK, disabilita dry-run
sed -i 's/"dryRun": true/"dryRun": false/' migration.config.json

# Esegui per davvero
npm run migrate:tokens
```

### 🆘 Workflow 5: Ripristino dopo Errori

```bash
# Scenario: Qualcosa è andato storto

# 1. Stop immediato
Ctrl+C

# 2. Valuta danni
git status
git diff

# 3a. Se modifiche minori: reset
git checkout -- .

# 3b. Se modifiche importanti: restore da backup
npm run restore
# Scegli backup più recente

# 4. Verifica ripristino
npm run validate
npm run test

# 5. Riprova con dry-run
# (vedi Workflow 4)
```

### 📦 Workflow 6: Pre-Produzione

**Checklist prima del deploy**

```bash
# ✅ Step 1: Validazione completa
npm run validate || exit 1

# ✅ Step 2: Test completi
npm run test:coverage || exit 1

# ✅ Step 3: Analisi finale
npm run analyze > pre-prod-analysis.txt

# ✅ Step 4: Build di produzione (se applicabile)
npm run build || exit 1

# ✅ Step 5: Report finale
npm run report > pre-prod-report.md

# ✅ Step 6: Commit con tag
git add .
git commit -m "chore: pre-production validation"
git tag -a v0.1.0 -m "Production ready"
git push origin main --tags

# ✅ Step 7: Backup pre-deploy
npm run backup
mv backups/backup-$(date +%Y%m%d) backups/pre-production-backup
```

---

## 🔧 Configurazione Avanzata

### File di Configurazione Completo

```json
{
  "version": "2.0",
  "workspaceRoot": "/Users/developer/projects/openfav",
  
  "paths": {
    "v3": "{{workspaceRoot}}/legacy-v3",
    "v4": "{{workspaceRoot}}/astroflux-V4",
    "v6": "{{workspaceRoot}}/openfav-codebase-V0"
  },
  
  "options": {
    "createBackup": true,
    "dryRun": false,
    "verbose": true,
    "debug": false,
    "outputFormat": "js",
    "autoApplyTokens": false
  },
  
  "tokenMappings": {
    "colors": {
      "source": {
        "v4": [
          { 
            "path": "{{v4}}/src/index.css",
            "type": "css",
            "pattern": "--([\\w-]+):\\s*([^;]+);"
          },
          {
            "path": "{{v4}}/src/styles/tokens.css",
            "type": "css"
          }
        ],
        "v3": [
          {
            "path": "{{v3}}/src/styles/variables.scss",
            "type": "scss"
          }
        ]
      },
      "mappings": {
        "background": {
          "v4Name": "--background-color",
          "v3Name": "$bg-color",
          "fallback": "222 47% 11%"
        },
        "primary": {
          "v4Name": "--primary-color",
          "v3Name": "$primary",
          "fallback": "262 83% 58%"
        }
      }
    },
    
    "typography": {
      "source": {
        "v4": [
          {
            "path": "{{v4}}/src/styles/typography.css",
            "type": "css"
          }
        ]
      },
      "fontFamily": {
        "sans": {
          "v4Name": "--font-sans",
          "fallback": "\"Inter\", system-ui, sans-serif"
        }
      },
      "fontSize": {
        "base": { "v4Name": "--text-base", "fallback": "1rem" },
        "lg": { "v4Name": "--text-lg", "fallback": "1.125rem" }
      },
      "lineHeight": {
        "base": { "v4Name": "--leading-base", "fallback": "1.5" }
      }
    },
    
    "spacing": {
      "source": {
        "v4": [
          {
            "path": "{{v4}}/src/styles/spacing.css",
            "type": "css"
          }
        ]
      },
      "space": {
        "0": { "v4Name": "--space-0", "fallback": "0" },
        "1": { "v4Name": "--space-1", "fallback": "0.25rem" },
        "2": { "v4Name": "--space-2", "fallback": "0.5rem" }
      }
    }
  },
  
  "componentMappings": {
    "button": {
      "v4Path": "{{v4}}/src/components/Button.tsx",
      "v6Path": "{{v6}}/src/react/components/ui/button.tsx",
      "transformations": [
        {
          "type": "import",
          "from": "@/components/Button",
          "to": "@/components/ui/button"
        },
        {
          "type": "class",
          "from": "btn-primary",
          "to": "bg-primary text-primary-foreground"
        },
        {
          "type": "prop",
          "from": "variant",
          "mappings": {
            "primary": "default",
            "secondary": "secondary"
          }
        }
      ]
    }
  },
  
  "validation": {
    "strictMode": true,
    "checkSourceExists": true,
    "checkDestinationWritable": true,
    "validateTokenFormats": true
  },
  
  "backup": {
    "enabled": true,
    "path": "{{workspaceRoot}}/backups",
    "maxBackups": 10,
    "compression": false
  },
  
  "reporting": {
    "enabled": true,
    "format": "markdown",
    "path": "{{workspaceRoot}}/reports",
    "includeStats": true
  },
  
  "api": {
    "enabled": true,
    "port": 3000,
    "host": "localhost",
    "cors": {
      "enabled": true,
      "origins": ["http://localhost:*"]
    }
  }
}
```

### Variabili d'Ambiente

Crea `.env` nella root del progetto:

```bash
# Configurazione generale
NODE_ENV=development
DEBUG=openfav:*

# Override path (sovrascrivono config)
SOURCE_PATH=/custom/source
DEST_PATH=/custom/dest
WORKSPACE_ROOT=/custom/workspace

# API Server
PORT=3000
HOST=0.0.0.0
API_KEY=your-secret-key

# Backup
BACKUP_PATH=/mnt/backups
MAX_BACKUPS=10

# Logging
LOG_LEVEL=info
LOG_FILE=migration.log

# Features flags
ENABLE_DRY_RUN=true
ENABLE_BACKUP=true
ENABLE_VERBOSE=false
```

### Utilizzo Variabili

```bash
# Metodo 1: Inline
PORT=3001 DEBUG=* npm run api

# Metodo 2: Export
export DEBUG=openfav:*
export LOG_LEVEL=debug
npm run migrate:tokens

# Metodo 3: File .env (consigliato)
echo "DEBUG=openfav:*" >> .env
npm run migrate:tokens
```

### Profile di Configurazione

```bash
# Profili multipli per diversi scenari
cp migration.config.json config.dev.json
cp migration.config.json config.staging.json
cp migration.config.json config.prod.json

# Uso con variabile d'ambiente
CONFIG_FILE=config.staging.json npm run migrate:tokens

# Script helper
cat > migrate-dev.sh <<'EOF'
#!/bin/bash
export CONFIG_FILE=config.dev.json
export DEBUG=openfav:*
npm run migrate:tokens
EOF
chmod +x migrate-dev.sh
./migrate-dev.sh
```

---

## 🐛 Troubleshooting

### Diagnostica Rapida

```bash
# 🔍 Script diagnostico completo
cat > diagnose.sh <<'EOF'
#!/bin/bash
echo "🔍 OpenFav Migration Diagnostics"
echo "================================"
echo ""
echo "📦 Environment:"
node --version
npm --version
echo ""
echo "📁 Paths:"
pwd
ls -la migration.config.json 2>/dev/null || echo "⚠️  Config not found"
echo ""
echo "✅ Validation:"
npm run validate
echo ""
echo "🧪 Quick test:"
npm test -- --bail
EOF
chmod +x diagnose.sh
./diagnose.sh
```

### Errori Comuni e Soluzioni

#### ❌ Error: "Cannot find module"

**Causa**: Moduli ES non configurati correttamente

```bash
# Soluzione 1: Verifica package.json
grep '"type"' package.json
# Deve essere: "type": "module"

# Soluzione 2: Reinstalla dipendenze
rm -rf node_modules package-lock.json
npm install

# Soluzione 3: Pulisci cache npm
npm cache clean --force
npm install
```

#### ❌ Error: "EACCES: permission denied"

**Causa**: Problemi di permessi filesystem

```bash
# Soluzione 1: Verifica permessi directory
ls -la src/

# Soluzione 2: Correggi ownership
sudo chown -R $(whoami) .

# Soluzione 3: Verifica path destinazione
ls -la /path/to/destination

# Soluzione 4: Usa sudo (solo se necessario)
sudo npm run migrate:tokens
```

#### ❌ Error: "Path does not exist"

**Causa**: Path non validi in configurazione

```bash
# Soluzione: Valida e correggi path
npm run validate

# Debug path
node -e "
  const config = require('./migration.config.json');
  console.log('V4 Path:', config.paths.v4);
  console.log('Exists:', require('fs').existsSync(config.paths