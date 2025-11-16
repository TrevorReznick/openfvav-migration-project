# OpenFav Migration Tool - Comandi

## Installazione

```bash
# Clonare il repository
git clone [repository-url]

# Installare le dipendenze
npm install
```

## Comandi Principali

### Setup e Configurazione
```bash
# Avvia la configurazione iniziale
npm run setup

# Verifica la configurazione
npm run validate
```

### Migrazione
```bash
# Esegui tutte le migrazioni
npm start

# Migrazione specifica per i token
npm run migrate:tokens

# Migrazione dei colori
npm run migrate:colors

# Migrazione della tipografia
npm run migrate:typography

# Migrazione degli spazi
npm run migrate:spacing

# Migrazione dei componenti
npm run migrate:components
```

### Analisi
```bash
# Esegui tutte le analisi
npm run analyze

# Analizza i token
npm run analyze:tokens

# Analisi specifica per Tailwind
npm run analyze:tailwind
```

### Utilità
```bash
# Applica i token
npm run apply-tokens

# Aggiorna gli import
npm run update-imports

# Crea un backup
npm run backup

# Genera report
npm run report
```

### API
```bash
# Avvia il server API
npm run api
```

## Sviluppo

### Test
```bash
# Esegui tutti i test
npm test

# Esegui i test in modalità watch
npm run test:watch

# Genera report di copertura
npm run test:coverage

# Esegui test con Vitest
npm run test:vitest
```

### Strumenti per Sviluppatori
```bash
# Pulisci i file generati
npx rimraf dist

# Esegui più comandi in parallelo
npx npm-run-all --parallel api test:watch
```

## Requisiti di Sistema
- Node.js >= 18.0.0
- npm o yarn

## Struttura del Progetto
- `/src` - Codice sorgente principale
- `/api` - Server API
- `/analyzers` - Script di analisi
- `/scripts` - Script di utilità
- `/src/utils` - Utilità varie

## Variabili d'Ambiente
Crea un file `.env` nella root del progetto con le seguenti variabili:
```
# Configurazione del server
PORT=3000

# Configurazione del database (se applicabile)
DB_HOST=localhost
DB_NAME=openfav
DB_USER=user
DB_PASS=password
```

## Troubleshooting
- Se incontri problemi con i moduli ES, assicurati di utilizzare Node.js 18 o superiore
- Per problemi di permessi, esegui i comandi con i permessi di amministratore se necessario
