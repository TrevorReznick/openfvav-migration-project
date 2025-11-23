# CSS Migration Debug Guide

## Problema
PostCSS genera un errore durante la migrazione dei colori, ma non si capisce quale riga specifica stia causando il problema.

## Soluzione Implementata
Ho aggiunto delle funzionalità di debug al migration tool per isolare il problema.

## Come Usare

### 1. Modalità Normale (per vedere l'errore)
```bash
node debug-css-test.js
# oppure
node src/cli.js colors
```
Questo mostrerà il CSS generato completo e l'errore PostCSS.

### 2. Modalità Debug (per isolare il problema)
```bash
node debug-css-test.js --debug
# oppure
node src/cli.js colors --debug
```
Questo commenterà temporaneamente le variabili `--color-*` per vedere se l'errore sparisce.

### 3. Confronto dei Log
Entrambe le modalità mostrano:
- `=== GENERATED GLOBALS.CSS ===` - Il CSS completo che verrà scritto
- `=== DEBUG COLOR VARIABLES ===` (solo in debug mode) - Le singole variabili con i loro valori

## Cosa Fare

### Step 1: Eseguire in Modalità Normale
```bash
node debug-css-test.js
```
- Prendi nota dell'errore PostCSS e della riga indicata
- Controlla il log `=== GENERATED GLOBALS.CSS ===`

### Step 2: Eseguire in Modalità Debug
```bash
node debug-css-test.js --debug
```
- Riavvia Astro
- Se l'errore sparisce, il problema è nelle variabili `--color-*`

### Step 3: Analizzare i Valori Sospetti
In debug mode, vedrai un log come:
```
=== DEBUG COLOR VARIABLES ===
--color-primary: hsl(210, 100%, 50%)
--color-secondary: hsl(180, undefined, 25%)
--color-accent: hsl(300, 80%, 60%)
=== END DEBUG ===
```

Cerca valori anomali come:
- `undefined` (come nell'esempio sopra)
- Valori numerici senza %
- Caratteri strani o non validi
- Parentesi non bilanciate

### Step 4: Isolare il Problema
Se trovi una riga sospetta (es. `--color-secondary: hsl(180, undefined, 25%)`):
1. Vai nel log del tuo script
2. Cerca quella chiave nel log `=== DEBUG COLOR VARIABLES ===`
3. Verifica il valore originale prima della conversione HSL

## Funzionalità Aggiunte

### 1. Console.log Automatico
Il sistema ora stampa automaticamente il CSS generato prima di scriverlo:
```javascript
console.log('=== GENERATED GLOBALS.CSS ===\n', newContent);
```

### 2. Debug Mode Flag
Aggiunto `--debug` flag per commentare le color variables:
```javascript
// In generatePreservedGlobals()
${debugMode ? '    /* ${colorVars} temporaneamente commentato */' : colorVars}
```

### 3. Logging Dettagliato
In debug mode, stampa ogni variabile con il suo valore:
```javascript
console.log('=== DEBUG COLOR VARIABLES ===');
Object.entries(colors).forEach(([key, value]) => {
  const hslValue = value.includes('hsl(var(') || value.includes('%') ? value : `hsl(${value})`;
  console.log(`--color-${key}: ${hslValue}`);
});
```

## Esempio di Workflow Completo

```bash
# 1. Test normale (dovrebbe mostrare l'errore)
node debug-css-test.js

# 2. Se c'è errore, testa in debug mode
node debug-css-test.js --debug

# 3. Riavvia Astro e controlla se l'errore sparisce
npm run dev

# 4. Analizza i log per trovare valori sospetti
# Cerca "=== DEBUG COLOR VARIABLES ===" nell'output

# 5. Una volta identificato il problema, correggi l'origine del dato
# o modifica la logica di conversione HSL
```

## Note Tecniche

- Il backup automatico viene sempre creato prima delle modifiche
- In debug mode, le variabili vengono commentate ma non rimosse
- Il log mostra sia il valore originale che quello convertito in HSL
- Puoi usare `--dry-run` con `--debug` per testare senza modificare file

## Comandi Utili

```bash
# Lista backup disponibili
node src/cli.js restore --list

# Ripristina globals.css dall'ultimo backup
node src/cli.js restore --file globals.css

# Test con dry-run e debug
node src/cli.js colors --dry-run --debug
```
