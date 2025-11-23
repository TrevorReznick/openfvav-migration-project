# 🌐 Interfaccia Web per Migration Tool

## 📋 Panoramica

Questa interfaccia web permette di eseguire le migrazioni di OpenFav da V3/V4 a V6 attraverso un'interfaccia grafica, senza dover usare la CLI direttamente.

## 🚀 Avvio

### Prerequisiti
- Node.js installato
- Le dipendenze del progetto principale installate

### Installazione dipendenze API
```bash
cd migration-v0/api
npm install
```

### Avvio del server
```bash
npm start
```

Il server sarà disponibile su `http://localhost:3000`

## 🎯 Funzionalità

### 1. Selezione Tipo Migrazione
- **Migrate Design Tokens**: Migra solo i design tokens
- **Migrate Components**: Migra solo i componenti
- **Run All Migrations**: Esegue tutte le migrazioni
- **Migrate Spacing**: Migra solo i token di spaziatura

### 2. Selezione Cartelle
- **Cartella Sorgente**: Path completo della cartella V3/V4
- **Cartella Destinazione**: Path completo della cartella V6

L'interfaccia permette di:
- Inserire manualmente i path completi
- Validare i path in tempo reale
- Verificare che i path esistano e siano cartelle valide

### 3. Esecuzione
- Validazione automatica dei path prima dell'esecuzione
- Output in tempo reale
- Indicatori di stato visivi

## ⚠️ Modifiche Necessarie al CLI

Per far funzionare completamente l'interfaccia web, è necessario modificare il CLI (`src/cli.js`) per accettare i path come argomenti opzionali.

### Modifica Richiesta

Aggiungere le opzioni `--source` e `--destination` al CLI:

```javascript
// In src/cli.js, modificare la funzione loadConfig per accettare override
async function loadConfig(options = {}) {
  // ... codice esistente ...
  
  // Se vengono passati source e destination, sovrascrivi i path nel config
  if (options.source) {
    config.paths.v4 = options.source;
  }
  if (options.destination) {
    config.paths.v6 = options.destination;
  }
  
  // ... resto del codice ...
}

// Aggiungere le opzioni globali
program
  .option('--source <path>', 'Override source path (V3/V4)')
  .option('--destination <path>', 'Override destination path (V6)')
  .option('--dry-run', 'Run without making any changes');

// Modificare i comandi per passare le opzioni
program.command('tokens')
  .action(async () => {
    const opts = program.opts();
    const config = await loadConfig({
      source: opts.source,
      destination: opts.destination
    });
    // ... resto del codice ...
  });
```

## 📁 Struttura File

```
api/
├── server.js              # Server Express
├── package.json           # Dipendenze API
├── public/
│   ├── index.html        # Interfaccia web
│   └── app.js            # JavaScript frontend
└── README.md             # Questo file
```

## 🔧 Endpoint API

### POST `/run-script`
Esegue uno script di migrazione.

**Body:**
```json
{
  "script": "tokens|components|all|spacing",
  "source": "/path/to/v4",
  "destination": "/path/to/v6"
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

### POST `/validate-paths`
Valida i path forniti.

**Body:**
```json
{
  "source": "/path/to/v4",
  "destination": "/path/to/v6"
}
```

**Response:**
```json
{
  "valid": true,
  "validation": {
    "source": {
      "path": "/path/to/v4",
      "exists": true,
      "isDirectory": true
    },
    "destination": {
      "path": "/path/to/v6",
      "exists": true,
      "isDirectory": true
    }
  }
}
```

### GET `/info`
Restituisce informazioni sul server.

**Response:**
```json
{
  "platform": "darwin",
  "nodeVersion": "v18.0.0",
  "cwd": "/path/to/project",
  "cliPath": "/path/to/cli.js",
  "cliExists": true
}
```

## 🐛 Problemi Noti

1. **Path Hardcoded**: Il server originale aveva un path hardcoded (`HOST_LOCAL`), ora rimosso
2. **CLI Modifiche**: Il CLI deve essere modificato per accettare `--source` e `--destination`
3. **Sicurezza**: L'interfaccia web non usa `showDirectoryPicker()` perché non può fornire path completi per motivi di sicurezza del browser

## 💡 Soluzione Implementata

L'interfaccia web ora:
- ✅ Permette inserimento manuale dei path completi
- ✅ Valida i path in tempo reale
- ✅ Mostra indicatori visivi di stato
- ✅ Gestisce errori in modo user-friendly
- ✅ Fornisce output dettagliato

## 🔐 Sicurezza

⚠️ **Nota**: Questa interfaccia web è pensata per uso locale/development. Per uso in produzione:
- Aggiungere autenticazione
- Validare e sanitizzare i path
- Limitare i path accessibili
- Usare HTTPS

## 📝 Note

- I path devono essere assoluti (completi)
- Su Windows, usare il formato: `C:\path\to\folder`
- Su macOS/Linux, usare il formato: `/path/to/folder`
- I path vengono validati prima dell'esecuzione

