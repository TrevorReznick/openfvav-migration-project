📋 OpenFav Migration Tool - Comandi
📦 Installazione
bash# Clonare il repository
git clone [repository-url]

# Installare le dipendenze
npm install

# Verificare l'installazione
node --version  # Deve essere >= 18.0.0

🚀 Setup e Configurazione
bash# Avvia la configurazione iniziale interattiva
npm run setup

# Verifica la validità della configurazione
npm run validate
Tip: Esegui sempre npm run validate dopo aver modificato migration.config.json

🎨 Migrazione Token
Migrazione Completa
bash# Esegui tutte le migrazioni
npm start

# Migrazione completa di tutti i token
npm run migrate:tokens

# Migrazione standalone (senza dipendenze esterne)
npm run migrate:tokens:standalone
Migrazione Specifica per Categoria
bash# Migra solo i colori
npm run migrate:colors

# Migra solo la tipografia
npm run migrate:typography

# Migra solo gli spacing
npm run migrate:spacing
Nota: I comandi specifici estraggono e convertono solo la categoria selezionata.

🧩 Migrazione Componenti
bash# Migra tutti i componenti
npm run migrate:components

# Analizza i componenti prima della migrazione
npm run migrate:components:analyze
Consiglio: Esegui sempre l'analisi prima della migrazione per identificare potenziali problemi.

🔍 Analisi
bash# Analisi completa del progetto
npm run analyze

# Analizza l'utilizzo dei token
npm run analyze:tokens

# Analizza i componenti React
npm run analyze:components

# Analizza le classi Tailwind CSS
npm run analyze:tailwind
Output: I report di analisi vengono salvati in ./reports/ (se configurato).

🛠️ Utility
bash# Applica i token ai file esistenti
npm run apply-tokens

# Aggiorna gli import nei componenti
npm run update-imports

# Crea un backup del progetto
npm run backup

# Ripristina da un backup precedente
npm run restore

# Genera report dettagliato della migrazione
npm run report

🌐 API Server
bash# Avvia il server API Express
npm run api
Server locale: http://localhost:3000
Endpoint disponibili:

POST /run-script - Esegue script di migrazione
POST /validate-paths - Valida i path forniti
GET /info - Informazioni sul server
GET /commands - Lista comandi disponibili


🧪 Testing
Jest
bash# Esegui tutti i test
npm test

# Test in modalità watch (ricarica automatica)
npm run test:watch

# Genera report di copertura
npm run test:coverage
Vitest
bash# Esegui test con Vitest
npm run test:vitest

# Vitest in modalità watch
npm run test:vitest:watch

# Copertura con Vitest
npm run test:vitest:coverage
Nota: Il progetto supporta sia Jest che Vitest per massima flessibilità.

⚡ Comandi Rapidi per Testing/Debug
Test Diretto del Generatore
bash# Test immediato senza modificare package.json
node src/tokens/generate-tokens-ts-fixed.js
Test con Opzioni Programmatiche
bash# Dry-run (preview senza scrivere file)
node -e "import('./src/tokens/generate-tokens-ts-fixed.js').then(m => m.migrateTokens('../astroflux-V4', {dryRun: true}))"

# Esecuzione reale con scrittura file
node -e "import('./src/tokens/generate-tokens-ts-fixed.js').then(m => m.migrateTokens('../astroflux-V4', {dryRun: false}))"

📊 Workflow Consigliati
🎯 Prima Migrazione Completa
bash# 1. Setup iniziale
npm run setup

# 2. Valida configurazione
npm run validate

# 3. Crea backup di sicurezza
npm run backup

# 4. Analizza il progetto sorgente
npm run analyze

# 5. Esegui migrazione token
npm run migrate:tokens

# 6. Verifica risultati
npm run analyze:tokens

# 7. Migra componenti
npm run migrate:components

# 8. Genera report finale
npm run report
🔄 Sviluppo Iterativo
bash# Test rapido del generatore
node src/tokens/generate-tokens-ts-fixed.js

# Analizza risultati
npm run analyze:tokens

# Ripeti fino a soddisfazione
🎨 Solo Migrazione Colori
bash# 1. Backup preventivo
npm run backup

# 2. Migra colori
npm run migrate:colors

# 3. Verifica output
npm run analyze:tokens
🧪 Test Sicuro (Dry-Run)
bash# 1. Valida configurazione
npm run validate

# 2. Modifica config: "dryRun": true

# 3. Esegui migrazione (solo preview)
npm run migrate:tokens

# 4. Controlla log per vedere cosa cambierebbe
🆘 Ripristino dopo Errori
bash# Ripristina da backup
npm run restore

# Seleziona il backup da ripristinare dall'elenco interattivo

🔧 Configurazione
File Principale
migration.config.json - Configurazione centrale del tool
Esempio Configurazione Minima
json{
  "version": "2.0",
  "workspaceRoot": "/path/to/workspace",
  "paths": {
    "v4": "/path/to/source-project",
    "v6": "/path/to/destination-project"
  },
  "options": {
    "createBackup": true,
    "dryRun": false,
    "verbose": true
  }
}
Variabili d'Ambiente (Opzionali)
Crea un file .env nella root:
env# Configurazione del server API
PORT=3000

# Modalità debug
DEBUG=true

# Path alternativi (sovrascrivono config)
SOURCE_PATH=/custom/source
DEST_PATH=/custom/dest
```

---

## 🏗️ Struttura del Progetto
```
openfav-migration-unified/
├── src/                      # Codice sorgente principale
│   ├── cli.js               # Entry point CLI
│   ├── tokens/              # Migrazione token
│   ├── components/          # Migrazione componenti
│   ├── config/              # Gestione configurazione
│   └── utils/               # Utility condivise
├── api/                     # Server API Express
├── analyzers/               # Script di analisi
├── scripts/                 # Script di utility
├── tests/                   # Test suite
└── migration.config.json    # Configurazione

📋 Requisiti di Sistema

Node.js: >= 18.0.0
npm: >= 8.0.0 (o yarn equivalente)
Sistema Operativo: Linux, macOS, Windows
Spazio disco: ~100MB per dipendenze

Verifica Requisiti
bashnode --version   # v18.0.0 o superiore
npm --version    # v8.0.0 o superiore

🐛 Troubleshooting
Errori Comuni
"Cannot find module" con ES modules
bash# Soluzione: Verifica che package.json contenga "type": "module"
cat package.json | grep '"type"'
Problemi di permessi
bash# Linux/macOS: Aggiungi sudo se necessario
sudo npm install

# Windows: Esegui come amministratore
Path non validi nella configurazione
bash# Verifica path assoluti
npm run validate

# Controlla che i path esistano
ls -la /path/to/source-project
Server API non si avvia
bash# Verifica che la porta 3000 sia libera
lsof -i :3000  # Linux/macOS
netstat -ano | findstr :3000  # Windows

# Usa porta alternativa in .env
echo "PORT=3001" > .env
Debug Avanzato
Abilita logging verbose
json// migration.config.json
{
  "options": {
    "verbose": true,
    "debug": true
  }
}
Test singolo modulo
bash# Test estrazione colori
node -e "import('./src/tokens/extractors/css-extractor.js').then(m => console.log(m))"

# Test conversione HSL
node -e "import('./src/tokens/converters/color-converter.js').then(m => console.log(m.hexToHSL('#7C3AED')))"

🎓 Best Practices
Prima di Iniziare

✅ Esegui npm run validate
✅ Crea backup con npm run backup
✅ Testa in dry-run mode prima di modifiche reali

Durante lo Sviluppo

✅ Usa npm run test:watch per feedback immediato
✅ Esegui npm run analyze per monitorare cambiamenti
✅ Committa spesso con messaggi descrittivi

In Produzione

✅ Disabilita dry-run: "dryRun": false
✅ Abilita backup automatici: "createBackup": true
✅ Genera report post-migrazione: npm run report


📚 Documentazione Correlata

README.md - Panoramica del progetto
PLAN.md - Piano di sviluppo dettagliato
PRD.md - Product Requirements Document
MIGRATION_FIXES_SUMMARY.md - Fix implementati


🆘 Supporto
Problemi Noti
Consulta la sezione Issues per problemi noti e soluzioni.
Contribuire
bash# Fork del repository
git clone [your-fork-url]

# Crea branch per feature
git checkout -b feature/my-feature

# Commit e push
git commit -am "feat: add feature"
git push origin feature/my-feature

Ultimo aggiornamento: Dicembre 2025
Versione documento: 2.0
Versione tool: 0.1
#
