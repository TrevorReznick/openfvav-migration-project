# Comandi per la Migrazione

## Setup Iniziale
```bash
# Clonare il repository
git clone [url-del-repository]

# Installare le dipendenze
npm install
# oppure
yarn install

# Configurare le variabili d'ambiente
cp .env.example .env
```

## Comandi di Migrazione

### Database
```bash
# Eseguire le migrazioni
npx sequelize-cli db:migrate

# Annullare l'ultima migrazione
npx sequelize-cli db:migrate:undo

# Eseguire i seed
npx sequelize-cli db:seed:all
```

### Sviluppo
```bash
# Avviare il server di sviluppo
npm run dev
# oppure
yarn dev

# Eseguire i test
npm test
# oppure
yarn test
```

### Build e Produzione
```bash
# Creare la build di produzione
npm run build
# oppure
yarn build

# Avviare in produzione
npm start
# oppure
yarn start
```

## Struttura delle Cartelle
- `/migrations` - File di migrazione del database
- `/models` - Modelli del database
- `/routes` - Route dell'API
- `/config` - File di configurazione
- `/public` - File statici

## Variabili d'Ambiente
- `PORT` - Porta del server
- `DB_HOST` - Host del database
- `DB_NAME` - Nome del database
- `DB_USER` - Utente del database
- `DB_PASS` - Password del database
- `NODE_ENV` - Ambiente (development/production)
