# 📋 Product Requirements Document (PRD)
OpenFav Migration Unified Tool

Version: 2.0  
Last Updated: 2025-01-11  
Status: In Development (35% Complete)  
Document Type: Consolidated PRD from validated partial documents

---

## 📑 Table of Contents
- [1. Executive Summary](#1-executive-summary)
  - [1.1 Project Vision](#11-project-vision)
  - [1.2 Key Objectives](#12-key-objectives)
  - [1.3 Target Users](#13-target-users)
  - [1.4 Success Criteria](#14-success-criteria)
- [2. Project Overview](#2-project-overview)
  - [2.1 Problem Statement](#21-problem-statement)
  - [2.2 Solution Overview](#22-solution-overview)
  - [2.3 Core Value Proposition](#23-core-value-proposition)
- [3. Product Evolution History](#3-product-evolution-history)
  - [3.1 Phase 1: Initial Prototypes (v0, v1, v2, v3)](#31-phase-1-initial-prototypes-v0-v1-v2-v3)
  - [3.2 Phase 2: Analysis & Planning](#32-phase-2-analysis--planning)
- [4. Current State Analysis](#4-current-state-analysis)
- [5. Technical Requirements](#5-technical-requirements)
- [6. Feature Specifications](#6-feature-specifications)
- [7. Implementation Roadmap](#7-implementation-roadmap)
- [8. Success Metrics](#8-success-metrics)
- [9. Appendices](#9-appendices)

---

## 1. Executive Summary

### 1.1 Project Vision
OpenFav Migration Unified è un tool CLI completo per migrare i design system OpenFav da V3/V4 a V6, combinando le migliori funzionalità dei tool precedenti per offrire estrazione automatica dei token, conversione dei colori e migrazione completa del design system (componenti, configurazioni, stili), con validazioni, backup e report.

### 1.2 Key Objectives
| Objective | Description | Priority |
| --- | --- | --- |
| Automated Token Extraction | Estrae automaticamente i design token da CSS/SCSS | 🔴 Critico |
| Color Format Conversion | Converte colori HEX/RGBA in HSL (compatibile V6) | 🔴 Critico |
| Component Migration | Migra componenti React/Astro con trasformazioni classi/props | 🟡 Alto |
| Web Interface | Dashboard web interattiva per migrazione guidata | 🟢 Medio |
| Production Ready | Affidabilità con validazione, backup e rollback | 🔴 Critico |

### 1.3 Target Users
- Frontend Developers che migrano progetti OpenFav da V3/V4 a V6
- Design System Teams che gestiscono migrazioni di design token
- Technical Leads che supervisionano migrazioni UI su larga scala

### 1.4 Success Criteria
- ✅ 100% accuratezza conversione colori (HEX/RGBA → HSL)
- ✅ Zero perdita di dati durante la migrazione
- ✅ Tempo di migrazione < 5 minuti per progetti tipici
- ✅ Automazione ≥ 90% (ridotta necessità di intervento manuale)
- ✅ Rollback completo e verificato

---

## 2. Project Overview

### 2.1 Problem Statement
OpenFav deve migrare da V3/V4 (HEX/RGBA) a V6 (HSL con design token). La migrazione manuale è:
- ⏱️ Lenta (giorni/settimane)
- ❌ Fallibile (errori nella conversione dei colori)
- 🔄 Incoerente (approcci differenti per progetto)
- 📉 Rischiosa (potenziale perdita dati, no rollback)

Esempio migrazione:

```css
/* V4 - Manual hex colors */
:root {
  --primary-color: #7C3AED;
  --card-bg: rgba(30, 41, 59, 0.3);
}

/* V6 - HSL design tokens system */
:root {
  --color-primary: 270 81% 60%;
  --card: 222 33% 17% / 0.3;
}
```

### 2.2 Solution Overview
Unified Migration Tool che:
- Estrae token dai sorgenti V4 (CSS/SCSS)
- Converte colori HEX/RGBA → HSL (compatibile Tailwind/vars)
- Genera token V6 (TypeScript + CSS variables)
- Migra componenti (imports/classi/props)
- Valida modifiche prima di applicarle
- Esegue backup e supporta rollback
- Supporta CLI e interfaccia web

### 2.3 Core Value Proposition
| Feature | V4 Manual Migration | Unified Tool |
| --- | --- | --- |
| Tempo migrazione | 3–5 giorni | < 1 ora |
| Accuratezza colori | ~85% | 100% |
| Rollback | ❌ No | ✅ Sì |
| Preview modifiche | ❌ No | ✅ Sì |
| Migrazione componenti | ❌ Manuale | ✅ Automatizzata |
| Validazione | ❌ No | ✅ Pre-flight checks |

---

## 3. Product Evolution History

### 3.1 Phase 1: Initial Prototypes (v0, v1, v2, v3)

#### 3.1.1 migration-v0 (First CLI Tool)
- Creato: Early 2024
- Tipo: CLI Tool + API Server
- Stato: ✅ Validato, archiviato
- Feature:
  - ✅ CLI con Commander.js
  - ✅ Migrazione design token da config
  - ✅ Migrazione componenti
  - ✅ Express API server per analisi
  - ✅ Tailwind analyzer
  - ✅ Script `apply-tokens.js`
- Limitazioni:
  - ❌ No estrazione automatica (richiede config manuale)
  - ❌ Scrive nella dir corrente (non nel target)
  - ❌ No supporto SCSS
- Validazione: ✅ Test di produzione, set di feature validato

#### 3.1.2 migration-v1 (First Astro App)
- Creato: Mid 2024
- Tipo: Astro + React App
- Stato: ✅ Validato, superato da v2
- Feature:
  - ✅ Prima app target V6
  - ✅ Token base (colors)
  - ✅ 3 componenti migrati (Button, LoadingSpinner, ThemeToggle)
  - ✅ Inclusi script migrazione
- Limitazioni:
  - ❌ Set componenti limitato
  - ❌ No integrazione shadcn/ui
  - ❌ Sistema token incompleto
- Validazione: ✅ POC validato

#### 3.1.3 migration-v2 (Complete Astro App)
- Creato: Late 2024
- Tipo: Astro + React App
- Stato: ✅ App production-ready
- Feature:
  - ✅ App V6 completa
  - ✅ shadcn/ui (49 componenti)
  - ✅ Token completi (colors, typography, spacing)
  - ✅ 8+ componenti custom migrati
  - ✅ Script `update-imports.js`
- Componenti:
  - AddCollectionDialog, AddLinkDialog, Dashboard (+ sub), Footer,
    ListDialog, Navbar (+ sub), RandomLinksDisplay, ThemeToggle
- Validazione: ✅ Pronta per produzione

#### 3.1.4 migration-v3 (Simplified CLI Tool)
- Creato: Late 2024
- Tipo: CLI Tool
- Stato: ✅ Architettura validata
- Feature:
  - ✅ Struttura CLI semplificata
  - ✅ Scrive direttamente nel path target (fix v0)
  - ✅ Supporto `lineHeight` in typography
  - ✅ Token dimensionali completi (spacing, padding, margin, borderRadius, borderWidth)
  - ✅ Modalità dry-run
  - ✅ Script `apply-tokens.js`
- Migliorie vs v0:
  - ✅ Migliore gestione path
  - ✅ Supporto token completo
  - ✅ Codice più pulito
- Limitazioni:
  - ❌ Nessuna estrazione automatica
  - ❌ No API server

### 3.2 Phase 2: Analysis & Planning
- Periodo: Dec 2024 – Jan 2025
- Stato: ✅ Completo
- Documenti (validati, presenti nel repo):
  - `ANALISI_VERSIONI.md` — confronto versioni (v2 best app, v0 best features)
  - `ANALISI_FATTIBILITA.md` — fattibilità migrazione (70% fattibile)
  - `CONFRONTO_MIGRAZIONE_TOKEN.md` — metodi estrazione token (v1/v2 auto-extraction migliore)
  - `MAPPATURA_STILI.md` — mapping completo V4 → V6
  - `API_WEB_INTERFACE.md` — specifiche interfaccia web
  - `README.md`, `SUMMARY.md` — overview progetto

---

## 4. Current State Analysis
Baseline dal repository attuale (`migration-dev-V0`):
- CLI (`src/cli.js`)
  - Opzioni globali: `--source`, `--destination`, `--dry-run`, `--verbose`
  - Comandi: `setup` (placeholder), `validate`, `tokens`, `colors` (WIP), `typography`
  - Config: `migration.config.json` (richiesto; esiste `migration.config.json.example`)
- Tokens
  - `src/tokens/migrate-tokens.js` orchestrazione migrazione token
  - Estrattori/generatori/mappers presenti nelle rispettive cartelle
- Color Conversion
  - `src/utils/color-converter.js` con funzioni: `hexToHsl`, `rgbaToHsl`, `rgbaStringToHsl`, `convertColorToHsl`
  - HSL formattato per Tailwind/CSS variables
- Component Migration
  - `src/components/migrate-components.js` (presente) + transformers/validators
- Web Interface (API)
  - `api/server.js` (Express): esecuzione script CLI, validazione path, elenco comandi
  - `api/public/index.html`, `api/public/app.js`: UI per inserire `source/destination`, selezione comandi, dry-run
- Known Gaps / TODO
  - `colors` command: segnato “not yet implemented” in CLI
  - Setup wizard interattivo: non implementato
  - Salvataggio configurazioni via web UI: non presente (inserimento manuale ogni esecuzione)

---

## 5. Technical Requirements
- Runtime: Node.js ≥ 18, npm ≥ 9 (target macOS/Linux)
- Package Manager: npm
- Linguaggi: JavaScript/TypeScript (CLI/AST trasf.), Astro/React (target app)
- Dipendenze chiave:
  - CLI: commander
  - Server API: express, child_process
  - Tooling: ripgrep (per ricerche), Tailwind (target HSL vars)
- Configurazione:
  - `migration.config.json` con `workspaceRoot`, `paths` (v3/v4/v6), `options`
  - Token mappings e component mappings (vedi `migration.config.json.example`)
- Requisiti I/O:
  - Input: path `source`, `destination`, config opzionale
  - Output: token V6 (TS/CSS), componenti aggiornati, report migrazione, backup

---

## 6. Feature Specifications

### 6.1 Automated Token Extraction
- Input: CSS/SCSS in V3/V4 (Tailwind, variabili CSS)
- Output: token normalizzati (colors, typography, spacing, ecc.)
- Funzioni:
  - Scanner file sorgente
  - Parser token e variabili
  - Mappatura verso schema V6
- Validazione:
  - Conflitti di nomi, token mancanti, formati non supportati

### 6.2 Color Format Conversion (HEX/RGBA → HSL)
- Input: colori `#RRGGBB`, `rgb(...)`, `rgba(...)`
- Output: stringhe HSL compatibili con `hsl(var(--color-...))`
- Algoritmi: basati su `color-converter.js`
- Copertura:
  - Varianti (DEFAULT, hover, light, dark)
  - Dark mode (override `.dark { ... }`)
- Accuratezza: 100% rispetto agli algoritmi definiti, con test unitari

### 6.3 Component Migration
- Ambito: React/Astro components
- Trasformazioni:
  - Import paths (es. shadcn/ui, componenti locali)
  - Classi (Tailwind → nuove variabili HSL)
  - Props (rinomina/normalizzazione)
- Validatori:
  - `src/components/validators/` (props/classi mancanti, breaking changes)
- Dry-run e report: anteprima diff, senza modifiche reali

### 6.4 Web Interface
- API Server: `api/server.js`
- UI: `api/public/index.html`, `api/public/app.js`
- Funzioni:
  - Inserimento/validazione `source/destination`
  - Selezione comandi (tokens, colors, components)
  - Esecuzione con `dry-run`
  - Output dettagliato nel browser
- Limiti attuali:
  - Nessun salvataggio persistente della configurazione
  - Richiede avvio server API

### 6.5 Validation, Backup & Rollback
- Pre-flight validation:
  - Verifica path e permessi
  - Verifica conflitti token e componenti
- Backup automatico:
  - Copia dei file prima della migrazione
- Rollback:
  - Ripristino da backup in caso di errori

---

## 7. Implementation Roadmap

### Fase A — Foundations (0–35%) [In corso]
- [x] CLI di base con opzioni globali
- [x] API server e web UI iniziale
- [x] Color converter (utilità)
- [x] Struttura tokens (estrattori/generatori/mappers)
- [ ] Comando `colors` implementato end-to-end
- [ ] Setup wizard interattivo (CLI)

### Fase B — Token & Components (35–70%)
- [ ] Estrazione automatica tokens (CSS/SCSS)
- [ ] Migrazione componenti core (Button, ThemeToggle, Navbar, Footer)
- [ ] Validatori componenti e tokens
- [ ] Report dettagliato (JSON + Markdown)

### Fase C — Production hardening (70–100%)
- [ ] Backup/rollback robusti
- [ ] Persistenza configurazioni via web UI
- [ ] Ottimizzazione performance (<5 minuti per progetto tipico)
- [ ] Copertura test ≥ 85%, smoke & integration tests
- [ ] Documentazione completa (Guide, How-to, API)

Milestone di rilascio:
- v2.0-beta: completamento Fase B
- v2.0: completamento Fase C

---

## 8. Success Metrics
- Accuratezza conversione colori: 100%
- Tempo medio migrazione: < 60 minuti
- Automazione: ≥ 90% del flusso senza intervento manuale
- Incidenza rollback: < 2% dei casi
- Tasso adozione tool: ≥ 80% tra progetti target
- Soddisfazione sviluppatori: ≥ 4.5/5 (survey interna)

---

## 9. Appendices
- Repository Structure (estratto):
  - `src/cli.js` — CLI principale
  - `src/utils/color-converter.js` — utilità conversione colori
  - `src/tokens/migrate-tokens.js` — orchestrazione tokens
  - `src/components/migrate-components.js` — migrazione componenti
  - `api/server.js`, `api/public/index.html`, `api/public/app.js` — interfaccia web
  - `migration.config.json.example` — esempio configurazione
- Documenti utili (presenti nel repo):
  - `ANALISI_VERSIONI.md`, `ANALISI_FATTIBILITA.md`, `MAPPATURA_STILI.md`
  - `API_WEB_INTERFACE.md`, `SUMMARY.md`, `README.md`
- Note:
  - Il PRD consolida i documenti validati e riflette lo stato corrente del repository indicato.
  - Sezioni incomplete/da dettagliare saranno aggiornate man mano che le feature avanzano.