# OpenFav Migration Unified 🚀

Tool di migrazione unificato che combina le migliori caratteristiche di tutte le versioni precedenti per offrire la soluzione più completa ed efficace per migrare OpenFav da V3/V4 a V6.

## ✨ Caratteristiche Principali

### 🎯 Estrazione Automatica Token (da v1/v2)
- Estrae automaticamente token da file CSS/SCSS sorgente
- Supporta CSS variables (`--primary: value`)
- Supporta SCSS variables (`$color-primary: value`)
- Mapping automatico con fallback V3 → V4

### 🔧 Tool Completo (da v0)
- API Express per analisi interattiva
- Tailwind analyzer per analisi classi utility
- Script apply-tokens per applicare token ai file

### 🎨 Struttura Pulita (da v3)
- Scrittura diretta in path target
- Supporto completo token dimensionali
- Dry-run mode completo
- Generazione index.js per import

### 🆕 Nuove Funzionalità
- Config wizard interattivo
- Backup/restore automatico
- Report dettagliato migrazione
- Validazione avanzata
- Progress tracking

## 📦 Installazione

```bash
npm install
```

## 🚀 Quick Start

### 1. Setup Iniziale

```bash
npm run setup
```

Questo lancerà un wizard interattivo per configurare il progetto.

### 2. Validazione

```bash
npm run validate
```

Verifica che tutti i path siano corretti e la configurazione sia valida.

### 3. Migrazione Token

```bash
# Migra tutti i token
npm run migrate:tokens

# Migra solo colors
npm run migrate:colors

# Dry-run (senza modifiche)
npm run migrate:tokens -- --dry-run
```

### 4. Migrazione Componenti

```bash
npm run migrate:components
```

### 5. Applica Token ai File

```bash
npm run apply-tokens
```

## 📝 Configurazione

Copia `migration.config.json.example` in `migration.config.json` e configura i path:

```json
{
  "version": "2.0",
  "workspaceRoot": "/path/to/workspace",
  "paths": {
    "v3": "/path/to/v3",
    "v4": "/path/to/v4",
    "v6": "/path/to/v6"
  },
  "tokenMappings": {
    "colors": {
      "source": {
        "v4": [
          { "path": "{v4}/src/styles/globals.css", "type": "css" }
        ]
      },
      "primary": { "v4Name": "--primary" }
    }
  }
}
```

## 🎮 Comandi Disponibili

### Migrazione
- `npm run migrate:tokens` - Migra tutti i token
- `npm run migrate:colors` - Migra solo colors
- `npm run migrate:typography` - Migra solo typography
- `npm run migrate:spacing` - Migra solo spacing
- `npm run migrate:components` - Migra componenti

### Applicazione
- `npm run apply-tokens` - Applica token ai file
- `npm run update-imports` - Aggiorna import

### Analisi
- `npm run analyze` - Analizza progetto
- `npm run analyze:tailwind` - Analizza classi Tailwind
- `npm run api` - Avvia API server

### Utilità
- `npm run setup` - Config wizard
- `npm run validate` - Valida configurazione
- `npm run backup` - Crea backup
- `npm run report` - Genera report

## 🔍 Approccio Ibrido

Il tool usa un approccio ibrido intelligente:

1. **Prima**: Prova estrazione automatica da file sorgente (CSS/SCSS)
2. **Fallback**: Usa configurazione manuale se file non trovati
3. **Output**: Supporta sia JSON che JS (configurabile)

## 📚 Documentazione

Vedi [PLAN.md](./PLAN.md) per la documentazione completa del progetto.

## 🛠️ Sviluppo

```bash
# Test
npm test

# Test watch
npm run test:watch

# Coverage
npm run test:coverage
```

## 📄 Licenza

MIT

