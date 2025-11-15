# Product Requirements Document (PRD)
# OpenFav Migration Unified

**Data:** 2025-01-09  
**Versione:** 2.0  
**Stato:** In Sviluppo (35% Completato)

---

## Indice

1. [Panoramica](#panoramica)
2. [Obiettivi](#obiettivi)
3. [Analisi delle Versioni Esistenti](#analisi-delle-versioni-esistenti)
4. [Funzionalità Principali](#funzionalità-principali)
5. [Architettura e Design](#architettura-e-design)
6. [Configurazione](#configurazione)
7. [Interfaccia Web](#interfaccia-web)
8. [Piano di Implementazione](#piano-di-implementazione)
9. [Testing e Qualità](#testing-e-qualità)
10. [Sicurezza e Backup](#sicurezza-e-backup)
11. [Deployment](#deployment)
12. [Roadmap](#roadmap)
13. [Appendici](#appendici)

---

## Panoramica

OpenFav Migration Unified è uno strumento di migrazione che combina le migliori caratteristiche delle versioni precedenti (v0, v1/v2, v3) per offrire una soluzione completa per migrare OpenFav da V3/V4 a V6. Il tool supporta la migrazione di design tokens, componenti e stili, con un approccio ibrido che unisce l'estrazione automatica da file sorgente e la configurazione manuale.

## Obiettivi

- **Unificazione**: Creare un unico tool che sostituisca le versioni precedenti, mantenendo la compatibilità
- **Automazione**: Minimizzare l'intervento manuale nell'estrazione e conversione di token e componenti
- **Flessibilità**: Supportare multiple fonti (CSS, SCSS, JSON) e formati di output (JSON, JS)
- **Sicurezza**: Implementare backup automatici e dry-run per prevenire perdite di dati
- **Usabilità**: Fornire un'interfaccia CLI e web per soddisfare diverse preferenze d'uso

## Analisi delle Versioni Esistenti

### migration-v0
- **Tipo**: CLI Tool completo
- **Punti di forza**: API Express, Tailwind analyzer, script apply-tokens, struttura modulare
- **Punti di debolezza**: Scrive nella directory corrente invece del target, mancanza di supporto per lineHeight

### migration-v1/v2
- **Tipo**: Progetto Astro + React (v1: base, v2: completo con shadcn/ui)
- **Punti di forza**: Estrazione automatica token da CSS/SCSS, mapping automatico, supporto multi-source
- **Punti di debolezza**: Non ha script apply-tokens integrato

### migration-v3
- **Tipo**: CLI Tool semplificato
- **Punti di forza**: Scrittura diretta in path target, supporto completo token dimensionali, dry-run
- **Punti di debolezza**: Manca API e alcuni analyzer

### Confronto Efficacia Migrazione Token
- **migration-v1/v2** è la più efficace per l'estrazione automatica da file sorgente
- **migration-v3** è adatto per configurazioni manuali già pronte
- **migration-v0** è sconsigliato per la scrittura in directory corrente

## Funzionalità Principali

### Estrazione Automatica Token (da v1/v2)
- Estrazione da CSS variables (`--primary: value`)
- Estrazione da SCSS variables (`$color-primary: value`)
- Supporto per multiple file sorgente
- Fallback da V3 a V4

### Tool Completo (da v0)
- API Express per analisi interattiva
- Tailwind analyzer per analisi classi utility
- Script apply-tokens per applicare token ai file

### Struttura Pulita (da v3)
- Scrittura diretta in path target
- Supporto completo token dimensionali (spacing, padding, margin, borderRadius, borderWidth)
- Dry-run mode
- Generazione index.js per import

### Nuove Funzionalità
- Config wizard interattivo
- Backup/restore automatico
- Report dettagliato migrazione
- Validazione avanzata
- Progress tracking

## Architettura e Design

### Struttura del Progetto
```
migration-unified/
├── src/
│   ├── config/          # Caricamento e validazione configurazione
│   ├── tokens/          # Migrazione token (estrattori, generatori, mapper)
│   ├── components/      # Migrazione componenti (trasformatori, validatori)
│   ├── utils/           # Utility (file, path, logger, backup, reporter)
│   └── validators/      # Validazione path e configurazione
├── scripts/             # Script apply-tokens e update-imports
├── analyzers/           # Analizzatori Tailwind e componenti
├── api/                 # API Express e dashboard web
└── tests/               # Test unitari e di integrazione
```

### Flusso di Migrazione
1. **Setup**: Configurazione tramite wizard o file
2. **Validazione**: Controllo path e file sorgente
3. **Estrazione**: Automatica da file CSS/SCSS o da configurazione
4. **Conversione**: Trasformazione colori (HEX/RGBA → HSL) e altri token
5. **Generazione**: File di token (JSON/JS) e aggiornamento Tailwind config
6. **Migrazione Componenti**: Trasformazione import, classi, props
7. **Applicazione Token**: Script apply-tokens per aggiornare i file
8. **Report**: Generazione report di migrazione

### Approccio Ibrido
- Prima estrazione automatica da file sorgente
- Fallback a configurazione manuale se i file non sono trovati
- Output in JSON o JS (configurabile)

## Configurazione

### File di Configurazione
Il file `migration.config.json` supporta:
- Path assoluti per V3, V4, V6
- Mapping token per colors, typography, spacing, ecc.
- Source files per estrazione automatica
- Opzioni per backup, dry-run, output format

### Esempio Configurazione
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

### Config Wizard
Setup interattivo per guidare l'utente nella configurazione iniziale

## Interfaccia Web

### Panoramica
- Dashboard web per eseguire migrazioni senza CLI
- Server Express su `http://localhost:3000`
- Validazione in tempo reale dei path
- Esecuzione comandi con output in tempo reale

### Endpoint API
- `POST /run-script`: Esegue script di migrazione
- `POST /validate-paths`: Valida i path forniti
- `GET /info`: Informazioni sul server
- `GET /commands`: Comandi disponibili

### Modifiche CLI Necessarie
- Aggiunta opzioni `--source` e `--destination` per sovrascrivere i path
- Modifica della funzione `loadConfig` per accettare override

## Piano di Implementazione

### Fase 1: Foundation (Settimana 1)
- Setup progetto, struttura directory, dipendenze
- Config loader e validator
- CLI base

### Fase 2: Token Migration Core (Settimana 2)
- CSS extractor, SCSS extractor, token mapper
- JSON generator, JS generator, index generator
- Migrazione token principale

### Fase 3: Token Migration Advanced (Settimana 3)
- Supporto token dimensionali completi
- Multi-source support e fallback
- Validazione token

### Fase 4: Component Migration (Settimana 4)
- Component migrator base
- Import transformer, class transformer, prop transformer
- Component validator

### Fase 5: Utilities (Settimana 5)
- Script apply-tokens migliorato
- Backup/restore system
- Reporter e logger

### Fase 6: Analysis & API (Settimana 6)
- Tailwind analyzer, component analyzer
- API Express e dashboard web

### Fase 7: Testing & Polish (Settimana 7)
- Test unitari e di integrazione
- Documentazione e esempi
- Error handling migliorato

## Testing e Qualità

### Strategia di Testing
- Unit test per funzioni di conversione, estrazione, validazione
- Integration test per il flusso di migrazione completo
- Fixture con progetti di esempio

### Metriche di Qualità
- 100% backward compatibility con config v1.0
- Zero breaking changes durante la migrazione
- Dry-run sempre disponibile
- Logging dettagliato e report completo

## Sicurezza e Backup

### Backup Automatico
- Creazione backup prima di ogni migrazione
- Rollback in caso di errori
- Gestione di multiple backup

### Sicurezza API
- Autenticazione tramite API key per uso in produzione
- Rate limiting e validazione path
- HTTPS per deployment pubblico

## Deployment

### Compatibilità
- Server Linux/Unix, Windows, container Docker, cloud services
- Node.js >= 18.0.0
- Accesso al filesystem con path assoluti

### Deployment con Docker
- Dockerfile e docker-compose.yml per containerizzazione
- Volume mounts per accesso ai progetti

### API su Host
- Avvio con PM2 o systemd
- Reverse proxy con Nginx per HTTPS

## Roadmap

### Fase 1 (Settimane 1-2)
- Completamento foundation e token migration core

### Fase 2 (Settimane 3-4)
- Token migration advanced e component migration

### Fase 3 (Settimane 5-6)
- Utilities e analysis & API

### Fase 4 (Settimana 7)
- Testing, documentazione, rilascio

## Appendici

### A. Documentazione Collegata
- [README.md](./README.md): Quick start e comandi base
- [PLAN.md](./PLAN.md): Piano completo del progetto
- [KIRO-SPEC.md](./KIRO-SPEC.md): Specifiche per lo sviluppo con Kiro
- [CONFRONTO_MIGRAZIONE_TOKEN.md](./CONFRONTO_MIGRAZIONE_TOKEN.md): Confronto dettagliato delle versioni
- [MAPPATURA_STILI.md](./MAPPATURA_STILI.md): Mappatura stili da Astroflux-V4 a Openfav-Dev
- [COLOR_CONVERSION_GUIDE.md](./COLOR_CONVERSION_GUIDE.md): Guida conversione colori
- [FLUSSO_MIGRAZIONE.md](./FLUSSO_MIGRAZIONE.md): Flusso di migrazione CLI e web
- [DEPLOYMENT_HOST.md](./DEPLOYMENT_HOST.md): Guida deployment su host
- [CLI_MODIFICATIONS.md](./CLI_MODIFICATIONS.md): Modifiche necessarie al CLI

### B. Note Tecniche
- **Conversione Colori**: Tutti i colori devono essere convertiti in HSL per OpenFav V6
- **Component Classes**: Le classi componenti devono essere convertite in utility classes o preservate
- **Design Tokens**: Centrali per il flusso di migrazione, generati in TypeScript

### C. Rischi e Mitigazione
- **Path non validi**: Validazione pre-esecuzione
- **Errori conversione**: Fallback e logging dettagliato
- **Permessi filesystem**: Controllo pre-migrazione

---

**Fine del PRD**