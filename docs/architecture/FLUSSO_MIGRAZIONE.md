# 🔄 Flusso di Migrazione: CLI e Web Interface

## 📋 Panoramica

Questo documento descrive il flusso completo di migrazione di OpenFav da V3/V4 a V6, sia tramite CLI che tramite interfaccia web.

---

## 🗺️ Mappatura Path

### Definizione dei Path

| Path | Ruolo | Descrizione |
|------|-------|-------------|
| **V4** | **Sorgente Principale** | Progetto sorgente da cui estrarre token, componenti e stili |
| **V3** | **Codebase Riferimento** | Codebase di riferimento/fallback (opzionale) per mapping alternativi |
| **V6** | **Destinazione Migrazione** | Progetto destinazione dove salvare i risultati della migrazione |

### Flusso Dati

```
V4 (Sorgente) → Estrazione Token/Componenti → Conversione → V6 (Destinazione)
     ↓
V3 (Riferimento) → Fallback/Mapping alternativi (se necessario)
```

---

## 🖥️ Flusso CLI

### 1. Setup Iniziale

#### Opzione A: Con File di Configurazione

```bash
# 1. Copia il file di esempio
cp migration.config.json.example migration.config.json

# 2. Modifica i path nel file
{
  "paths": {
    "v3": "/path/to/openfav-v3",    # Codebase riferimento (opzionale)
    "v4": "/path/to/openfav-v4",    # Sorgente principale
    "v6": "/path/to/openfav-v6"     # Destinazione migrazione
  }
}
```

#### Opzione B: Senza File di Configurazione (Path Diretti)

```bash
# Usa --source e --destination direttamente
node src/cli.js tokens \
  --source /path/to/v4 \
  --destination /path/to/v6
```

### 2. Validazione Configurazione

```bash
node src/cli.js validate
```

**Output:**
```
✓ Configuration loaded
  Workspace: /path/to/workspace
  V3 Path (codebase riferimento): /path/to/openfav-v3
  V4 Path (sorgente principale): /path/to/openfav-v4
  V6 Path (destinazione migrazione): /path/to/openfav-v6
```

### 3. Comandi di Migrazione

#### Migrare Tutti i Token

```bash
# Con config file
node src/cli.js tokens

# Con path diretti
node src/cli.js tokens --source /path/to/v4 --destination /path/to/v6

# Dry-run (simula senza modificare)
node src/cli.js tokens --dry-run
```

**Flusso:**
1. Estrae token da `tailwind.config.ts` (V4)
2. Estrae CSS variables da file CSS (V4)
3. Converte colori HEX/RGBA → HSL
4. Genera design tokens in V6
5. Aggiorna CSS variables in `globals.css` (V6)
6. Aggiorna `tailwind.config.ts` (V6)

#### Migrare Solo Colori

```bash
node src/cli.js colors --source /path/to/v4 --destination /path/to/v6
```

**Flusso:**
1. Estrae solo colori da `tailwind.config.ts` (V4)
2. Estrae solo colori da CSS variables (V4)
3. Converte HEX/RGBA → HSL
4. Genera/aggiorna design tokens colori (V6)
5. Aggiorna CSS variables colori (V6)
6. Aggiorna `tailwind.config.ts` colori (V6)

#### Migrare Solo Tipografia

```bash
node src/cli.js typography --source /path/to/v4 --destination /path/to/v6
```

**Flusso:**
1. Estrae variabili tipografia da CSS (V4)
2. Filtra variabili (`font-*`, `text-*`, `leading-*`, `tracking-*`)
3. Aggiorna CSS variables tipografia in `globals.css` (V6)

#### Migrare Componenti

```bash
node src/cli.js components --source /path/to/v4 --destination /path/to/v6
```

**Flusso:**
1. Estrae component classes da CSS (V4)
2. Trova componenti React/TSX in `src/components/` (V4)
3. Copia componenti in `src/react/components/ui/` (V6)
4. Crea directory se non esiste (V6)

#### Eseguire Tutte le Migrazioni

```bash
node src/cli.js all --source /path/to/v4 --destination /path/to/v6
```

**Flusso:**
1. Step 1: Migra Design Tokens (colori, keyframes, animazioni)
2. Step 2: Migra Typography
3. Step 3: Migra Components
4. Genera report finale

### 4. Opzioni CLI

```bash
# Dry-run (simula senza modificare file)
--dry-run

# Verbose (output dettagliato)
--verbose

# Override path sorgente
--source <path>

# Override path destinazione
--destination <path>
```

---

## 🌐 Flusso Web Interface

### 1. Avvio Server

```bash
# Dalla root del progetto
cd api
node server.js

# O se configurato in package.json
npm run api
```

**Server disponibile su:** `http://localhost:3000`

### 2. Interfaccia Web

#### Accesso
Apri il browser su `http://localhost:3000`

#### Form di Migrazione

**Campi:**
- **Tipo di Migrazione**: Menu a tendina con comandi disponibili
- **Cartella Sorgente (V4)**: Path completo del progetto V4
- **Cartella Destinazione (V6)**: Path completo del progetto V6
- **Dry Run**: Checkbox per simulare senza modificare

#### Validazione Path

- **Validazione in tempo reale**: I path vengono validati quando si esce dal campo (blur)
- **Indicatori visivi**: 
  - ✓ Verde = Path valido
  - ✗ Rosso = Path non valido
- **Pulsanti validazione**: Clic su ✓ per validare manualmente

### 3. Esecuzione Migrazione

1. **Seleziona comando** dal menu a tendina
2. **Inserisci path** sorgente (V4) e destinazione (V6)
3. **Valida path** (automatico o manuale)
4. **Opzionale**: Attiva Dry Run
5. **Clicca "Esegui Migrazione"**

### 4. Output e Risultati

**Durante esecuzione:**
- Bottone disabilitato con spinner
- Output in tempo reale nell'area risultati

**Dopo esecuzione:**
- ✅ Successo: Output verde con dettagli
- ❌ Errore: Output rosso con messaggio di errore

### 5. Endpoint API

#### POST `/run-script`
Esegue un comando di migrazione.

**Body:**
```json
{
  "script": "tokens|colors|typography|components|all",
  "source": "/path/to/v4",
  "destination": "/path/to/v6",
  "dryRun": false
}
```

**Response:**
```json
{
  "success": true,
  "exitCode": 0,
  "stdout": "...",
  "stderr": "",
  "message": "Script executed successfully"
}
```

#### POST `/validate-paths`
Valida i path forniti.

**Body:**
```json
{
  "source": "/path/to/v4",
  "destination": "/path/to/v6"
}
```

#### GET `/commands`
Restituisce tutti i comandi disponibili con stato di implementazione.

#### GET `/info`
Informazioni sul server e configurazione.

#### POST `/create-config`
Crea automaticamente `migration.config.json` da esempio.

---

## 🔄 Flusso Completo di Migrazione

### Scenario: Migrazione Completa da V4 a V6

#### Fase 1: Preparazione

1. **Verifica path:**
   ```bash
   node src/cli.js validate
   ```

2. **Test dry-run:**
   ```bash
   node src/cli.js all --dry-run --source /path/to/v4 --destination /path/to/v6
   ```

#### Fase 2: Migrazione Token

1. **Migra design tokens:**
   ```bash
   node src/cli.js tokens --source /path/to/v4 --destination /path/to/v6
   ```
   
   **Risultato:**
   - File generato: `{v6}/src/lib/tokens.ts`
   - CSS aggiornato: `{v6}/src/styles/globals.css`
   - Config aggiornato: `{v6}/tailwind.config.ts`

2. **Verifica risultati:**
   - Controlla che i colori siano stati convertiti in HSL
   - Verifica che le CSS variables siano presenti
   - Controlla che `tailwind.config.ts` sia aggiornato

#### Fase 3: Migrazione Tipografia

```bash
node src/cli.js typography --source /path/to/v4 --destination /path/to/v6
```

**Risultato:**
- CSS variables tipografia aggiunte a `globals.css`

#### Fase 4: Migrazione Componenti

```bash
node src/cli.js components --source /path/to/v4 --destination /path/to/v6
```

**Risultato:**
- Componenti copiati in `{v6}/src/react/components/ui/`
- Component classes estratte e documentate

#### Fase 5: Verifica Finale

1. **Controlla file generati:**
   - Design tokens
   - CSS variables
   - Componenti migrati

2. **Test progetto V6:**
   - Compila il progetto
   - Verifica che i token siano utilizzabili
   - Testa i componenti migrati

---

## 📊 Struttura File Generati

### Design Tokens

**Path:** `{v6}/src/lib/tokens.ts`

```typescript
export const designTokens = {
  colors: { ... },
  typography: { ... },
  spacing: { ... }
}
```

### CSS Variables

**Path:** `{v6}/src/styles/globals.css`

```css
:root {
  /* Design Tokens - Colors (migrated) */
  --color-primary: 270 81% 60%;
  --color-secondary: 222 47% 11%;
  /* ... */
  
  /* Design Tokens - Typography (migrated) */
  --font-sans: 'Inter', sans-serif;
  /* ... */
}
```

### Tailwind Config

**Path:** `{v6}/tailwind.config.ts`

```typescript
colors: {
  primary: "hsl(var(--color-primary))",
  secondary: "hsl(var(--color-secondary))",
  // ...
}
```

### Componenti Migrati

**Path:** `{v6}/src/react/components/ui/`

```
ui/
├── Button.tsx
├── Navbar.tsx
├── Footer.tsx
└── ...
```

---

## 🎯 Best Practices

### 1. Sempre Testare con Dry-Run

```bash
# Prima di eseguire la migrazione reale
node src/cli.js all --dry-run --source /path/to/v4 --destination /path/to/v6
```

### 2. Backup Prima della Migrazione

```bash
# Crea backup del progetto V6 prima di migrare
cp -r /path/to/v6 /path/to/v6-backup
```

### 3. Migrazione Incrementale

Esegui le migrazioni in ordine:
1. Prima i token (colori, tipografia)
2. Poi i componenti
3. Infine verifica e testa

### 4. Validazione Continua

```bash
# Dopo ogni migrazione, valida i risultati
node src/cli.js validate
```

### 5. Usa Interfaccia Web per Test

L'interfaccia web è ideale per:
- Test rapidi
- Validazione path
- Visualizzazione output
- Dry-run interattivo

---

## ⚠️ Note Importanti

### Path Mapping

- **V4 è sempre la sorgente principale** - da qui vengono estratti tutti i token e componenti
- **V3 è opzionale** - usato solo per mapping alternativi se configurato
- **V6 è sempre la destinazione** - qui vengono salvati tutti i risultati

### File di Configurazione

Il file `migration.config.json` è **opzionale** se usi:
- CLI con `--source` e `--destination`
- Interfaccia web (path inseriti direttamente)

È **necessario** solo per:
- Eseguire comandi CLI senza specificare path ogni volta
- Configurare mapping avanzati di token e componenti

### Dry-Run Mode

Sempre disponibile e consigliato per:
- Verificare cosa verrebbe modificato
- Testare la configurazione
- Validare i path prima della migrazione reale

---

## 🔍 Troubleshooting

### Path Non Trovati

**Problema:** `Path for v4 does not exist`

**Soluzione:**
- Verifica che il path sia corretto e assoluto
- Controlla che la directory esista
- Usa path completi (non relativi)

### File Non Trovati

**Problema:** `tailwind.config.ts not found`

**Soluzione:**
- Verifica che il progetto V4 abbia `tailwind.config.ts` o `tailwind.config.js`
- Controlla che il path sorgente sia corretto

### Errori di Conversione

**Problema:** `Could not convert color`

**Soluzione:**
- Verifica il formato del colore nel sorgente
- Controlla che sia HEX, RGB, RGBA o HSL valido
- I colori già in HSL vengono preservati

---

## 📚 Riferimenti

- **README.md**: Quick start e comandi base
- **PLAN.md**: Piano completo del progetto
- **migration.config.json.example**: Esempio configurazione completa
- **API_WEB_INTERFACE.md**: Documentazione interfaccia web

---

**Ultimo aggiornamento:** 2025-01-09  
**Versione documento:** 1.0

