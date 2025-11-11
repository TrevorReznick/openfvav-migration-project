# 🚀 Deployment su Servizio Host: CLI e API

## 📋 Panoramica

Il CLI e l'API possono essere eseguiti sia **localmente** che su un **servizio host remoto**. Questo documento descrive come deployare e utilizzare il tool su un server.

---

## ✅ Compatibilità Host

### Il CLI può essere eseguito su:

- ✅ **Server Linux/Unix** (Ubuntu, Debian, CentOS, etc.)
- ✅ **Server Windows** (con Node.js installato)
- ✅ **Container Docker**
- ✅ **Cloud Services** (AWS, Azure, GCP, Heroku, etc.)
- ✅ **VPS** (DigitalOcean, Linode, etc.)
- ✅ **Server locale** (stessa macchina)

### Requisiti

- **Node.js** >= 18.0.0
- **Accesso al filesystem** per leggere/scrivere file
- **Path assoluti** ai progetti V4 e V6 accessibili dal server

---

## 🔧 Configurazione per Host

### 1. Installazione su Server

```bash
# 1. Clona o carica il progetto sul server
git clone <repository-url>
cd migration-dev-V0

# 2. Installa dipendenze
npm install

# 3. Verifica installazione
node src/cli.js --version
```

### 2. Configurazione Path

#### Opzione A: Path Assoluti sul Server

```json
{
  "paths": {
    "v3": "/var/www/openfav-v3",
    "v4": "/var/www/openfav-v4",
    "v6": "/var/www/openfav-v6"
  }
}
```

#### Opzione B: Path via Network/SSH

Se i progetti sono su server diversi, usa:
- **NFS** (Network File System)
- **SSHFS** (SSH File System)
- **Samba/CIFS** (Windows shares)
- **Volume mounts** (Docker)

**Esempio con SSHFS:**
```bash
# Monta filesystem remoto
sshfs user@remote-server:/path/to/projects /mnt/remote-projects

# Usa path montati
{
  "paths": {
    "v4": "/mnt/remote-projects/v4",
    "v6": "/mnt/remote-projects/v6"
  }
}
```

### 3. Permessi Filesystem

Assicurati che il processo Node.js abbia i permessi necessari:

```bash
# Verifica permessi
ls -la /path/to/v4
ls -la /path/to/v6

# Se necessario, aggiusta permessi
chmod -R 755 /path/to/v4
chmod -R 755 /path/to/v6
```

---

## 🌐 API Server su Host

### 1. Avvio API

```bash
# Avvio diretto
node api/server.js

# Con PM2 (production)
pm2 start api/server.js --name migration-api

# Con systemd (Linux)
# Crea /etc/systemd/system/migration-api.service
```

### 2. Configurazione Porta

```bash
# Variabile d'ambiente
PORT=8080 node api/server.js

# O modifica direttamente in api/server.js
const port = process.env.PORT || 3000;
```

### 3. Accesso Remoto

**Per default, l'API è accessibile solo da localhost.** Per accesso remoto:

```javascript
// In api/server.js, modifica:
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Migration API Server listening at http://0.0.0.0:${port}`);
});
```

**⚠️ Attenzione Sicurezza:** Se esponi l'API pubblicamente, aggiungi:
- Autenticazione
- Rate limiting
- HTTPS
- Firewall rules

### 4. Reverse Proxy (Nginx)

```nginx
# /etc/nginx/sites-available/migration-api
server {
    listen 80;
    server_name migration.example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🔐 Considerazioni di Sicurezza

### 1. Autenticazione API

**Implementazione base:**

```javascript
// In api/server.js
const API_KEY = process.env.API_KEY || 'your-secret-key';

app.use('/run-script', (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});
```

### 2. Validazione Path

**Limitare path accessibili:**

```javascript
const ALLOWED_PATHS = [
  '/var/www/projects',
  '/home/user/projects'
];

function isPathAllowed(path) {
  return ALLOWED_PATHS.some(allowed => path.startsWith(allowed));
}

// In /run-script endpoint
if (!isPathAllowed(source) || !isPathAllowed(destination)) {
  return res.status(403).json({
    error: 'Path not allowed',
    message: 'Only paths within allowed directories are permitted'
  });
}
```

### 3. Rate Limiting

```bash
npm install express-rate-limit
```

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 100 // max 100 richieste per finestra
});

app.use('/run-script', limiter);
```

### 4. HTTPS

Usa sempre HTTPS in produzione:

```bash
# Con Let's Encrypt
certbot --nginx -d migration.example.com
```

---

## 🐳 Deployment con Docker

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copia file progetto
COPY package*.json ./
COPY . .

# Installa dipendenze
RUN npm ci --only=production

# Esponi porta
EXPOSE 3000

# Avvia API
CMD ["node", "api/server.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  migration-api:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - /var/www/projects:/projects:ro  # V4 (read-only)
      - /var/www/migrations:/migrations  # V6 (read-write)
    environment:
      - PORT=3000
      - API_KEY=${API_KEY}
    restart: unless-stopped
```

### Build e Run

```bash
# Build
docker build -t migration-tool .

# Run
docker run -d \
  -p 3000:3000 \
  -v /var/www/projects:/projects \
  -e API_KEY=your-secret-key \
  migration-tool
```

---

## ☁️ Deployment Cloud

### Heroku

```bash
# Procfile
web: node api/server.js

# Deploy
heroku create migration-api
git push heroku main
```

### AWS EC2

```bash
# 1. SSH nel server
ssh -i key.pem ubuntu@ec2-instance

# 2. Installa Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Clona e avvia
git clone <repo>
cd migration-dev-V0
npm install
pm2 start api/server.js
```

### Google Cloud Run

```yaml
# cloudbuild.yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/migration-api', '.']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/migration-api']
```

---

## 📡 Uso da Client Remoto

### CLI Remoto (SSH)

```bash
# Esegui CLI via SSH
ssh user@server "cd /path/to/migration-tool && node src/cli.js tokens --source /var/www/v4 --destination /var/www/v6"
```

### API Remota

```javascript
// Client JavaScript
const response = await fetch('https://migration.example.com/run-script', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-api-key'
  },
  body: JSON.stringify({
    script: 'tokens',
    source: '/var/www/v4',
    destination: '/var/www/v6',
    dryRun: false
  })
});
```

---

## 🔍 Verifica Funzionamento

### Test Locale

```bash
# Test CLI
node src/cli.js validate

# Test API
curl http://localhost:3000/info
```

### Test Remoto

```bash
# Test API remota
curl https://migration.example.com/info \
  -H "X-API-Key: your-api-key"

# Test migrazione
curl -X POST https://migration.example.com/run-script \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "script": "tokens",
    "source": "/var/www/v4",
    "destination": "/var/www/v6",
    "dryRun": true
  }'
```

---

## ⚠️ Limitazioni e Considerazioni

### Limitazioni

1. **Filesystem Access**: Il server deve avere accesso ai path V4 e V6
2. **Permessi**: Il processo Node.js deve avere permessi di lettura (V4) e scrittura (V6)
3. **Network**: Se i progetti sono su server diversi, serve filesystem condiviso o montato
4. **Performance**: Operazioni su network filesystem possono essere più lente

### Best Practices

1. **Usa path assoluti** sempre
2. **Valida path** prima di eseguire operazioni
3. **Limita accesso** ai path necessari
4. **Usa HTTPS** in produzione
5. **Implementa autenticazione** per API pubblica
6. **Monitora risorse** (CPU, memoria, disco)
7. **Backup automatico** prima delle migrazioni

---

## 📊 Architettura Consigliata

### Scenario 1: Tutto su Stesso Server

```
Server
├── /var/www/v4 (sorgente)
├── /var/www/v6 (destinazione)
└── /opt/migration-tool (CLI/API)
```

### Scenario 2: Server Separati

```
Server A (V4)          Server B (V6)          Server C (Migration Tool)
     │                       │                          │
     └───────────────────────┼──────────────────────────┘
                            │
                    (NFS/SSHFS mount)
```

### Scenario 3: Cloud Storage

```
Cloud Storage (S3/GCS)  ←  Migration Tool  →  Cloud Storage (S3/GCS)
   (V4 files)              (Esegue migrazione)    (V6 files)
```

---

## 🛠️ Troubleshooting

### Problema: Path Non Accessibili

**Errore:** `Source path does not exist`

**Soluzione:**
```bash
# Verifica mount
mount | grep /mnt/remote

# Verifica permessi
ls -la /path/to/v4

# Test accesso
node -e "const fs = require('fs'); console.log(fs.existsSync('/path/to/v4'))"
```

### Problema: Permessi Negati

**Errore:** `EACCES: permission denied`

**Soluzione:**
```bash
# Aggiusta permessi
sudo chown -R $USER:$USER /path/to/v6
chmod -R 755 /path/to/v6
```

### Problema: API Non Accessibile da Remoto

**Errore:** Connection refused

**Soluzione:**
```javascript
// In api/server.js, cambia:
app.listen(port, '0.0.0.0', () => { ... });

// Verifica firewall
sudo ufw allow 3000/tcp
```

---

## 📝 Checklist Deployment

### Pre-Deployment

- [ ] Node.js >= 18.0.0 installato
- [ ] Dipendenze installate (`npm install`)
- [ ] Path V4 e V6 accessibili
- [ ] Permessi filesystem corretti
- [ ] Config file creato (opzionale)

### Deployment

- [ ] API server avviato
- [ ] Porta configurata
- [ ] Firewall configurato
- [ ] Reverse proxy configurato (se necessario)
- [ ] HTTPS configurato (produzione)

### Post-Deployment

- [ ] Test endpoint `/info`
- [ ] Test endpoint `/commands`
- [ ] Test migrazione con dry-run
- [ ] Monitoraggio attivo
- [ ] Backup configurato

---

## 🎯 Conclusione

**Il CLI può essere eseguito su qualsiasi servizio host** che:
- Ha Node.js installato
- Ha accesso al filesystem dove sono i progetti
- Supporta operazioni file I/O standard

**L'API può essere esposta pubblicamente** con le dovute precauzioni di sicurezza (autenticazione, HTTPS, rate limiting).

**Raccomandazione:** Per uso in produzione, usa:
- Container Docker per isolamento
- Reverse proxy (Nginx) per HTTPS
- Process manager (PM2) per stabilità
- Monitoring per osservabilità

---

**Ultimo aggiornamento:** 2025-01-09  
**Versione:** 1.0



