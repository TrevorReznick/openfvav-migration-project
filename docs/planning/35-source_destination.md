# Differenza Chiave: codebase vs migration-dev-V0 con i tokens

## openfav-codebase-V0: Estrae e Mappa da astroflux-V4

Il sistema `codebase` è progettato per **estrarre token da V4** e mapparli a Shadcn/ui:

### 1. Estrazione Intelligente (line 116-138)
- Legge i colori da `astroflux-V4/src/index.css`
- Converte da **HEX → HSL**
- Mappa nomi V4 → Shadcn/ui

### 2. Mapping Completo (line 35-80)
- **Fallback completo**: 31 token Shadcn/ui standard
- **Direct mappings**: `background-color` → `background`
- **Synonym mappings**: `bg` → `background`, `brand` → `primary`

### 3. Preservazione Contenuto
- Mantiene utilities esistenti in `globals.css`
- Non sovrascrive tutto

---

## migration-dev-V0: Generatore Minimal Autonomo

Il sistema `migration-dev-V0` **non estrae da V4**, ma genera token minimal autonomi:

### 1. Hard-coded Minimal (line 4-13)
- Solo **9 colori predefiniti**
- Nessuna estrazione da V4

### 2. Globals.css Incompleto (line 87-126)
- Riferisce a variabili **non definite** (`--primary-foreground`, `--muted`, etc.)
- Non usa fallback

---

## ⚠️ Il Problema Principale

**migration-dev-V0** non usa affatto i token di `astroflux-V4`:
- ❌ Non legge `src/index.css` di V4
- ❌ Non converte `#0F172A` → `222 47% 11%`
- ❌ Genera token autonomi senza connessione al sorgente

**codebase-V0** invece:
- ✅ Estrae effettivamente da V4
- ✅ Converte formati (HEX → HSL)
- ✅ Mappa intelligentemente nomi diversi

---

## 💡 Soluzione

`migration-dev-V0` dovrebbe implementare la stessa logica di estrazione di `codebase-V0` per essere davvero una **"migrazione"** e non solo un generatore autonomo.