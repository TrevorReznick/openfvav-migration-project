# Confronto Efficacia Migrazione Token

## 🎯 Risposta Diretta

**migration-v1/v2** è la versione **più efficace** per migrare token da progetto A a progetto B perché:
- ✅ **Estrae automaticamente** i token dai file sorgente (CSS/SCSS)
- ✅ **Supporta parsing** di CSS variables e SCSS variables
- ✅ **Applica mapping personalizzati** automaticamente
- ✅ **Non richiede configurazione manuale** completa dei valori

**migration-v3** è la seconda scelta migliore per progetti con configurazione già pronta.

---

## 📊 Confronto Dettagliato

### 1. migration-v0

**Approccio**: Basato su configurazione statica  
**Efficacia**: ⭐⭐ (2/5)

#### Caratteristiche:
- ✅ Crea token da configurazione JSON
- ✅ Supporta colors, typography, spacing, padding, margin, borderRadius, borderWidth
- ✅ Genera file JSON
- ✅ Genera file index.js per import
- ✅ Supporta dry-run
- ✅ Ha script `apply-tokens.js` per applicare token ai file del progetto
- ❌ **NON legge dai file sorgente** - richiede configurazione manuale completa
- ❌ Scrive nella directory corrente invece che nel progetto target

#### Codice chiave:
```javascript
// Crea token solo da config, non legge file sorgente
const colors = {
  primary: config.tokenMappings.colors.primary.v4Name,
  secondary: config.tokenMappings.colors.secondary.v4Name,
  // ...
};
writeFileSync(join(tokensPath, 'colors.json'), JSON.stringify(colors, null, 2));
```

#### Quando usarlo:
- Hai già una configurazione completa dei token
- Vuoi applicare i token ai file esistenti (con `apply-tokens.js`)
- Preferisci controllo manuale completo

---

### 2. migration-v1/v2

**Approccio**: Estrazione automatica da file sorgente  
**Efficacia**: ⭐⭐⭐⭐⭐ (5/5) ⭐ **MIGLIORE**

#### Caratteristiche:
- ✅ **Legge direttamente dai file CSS/SCSS** del progetto sorgente
- ✅ **Estrae CSS variables** (`--primary: value`)
- ✅ **Estrae SCSS variables** (`$color-primary: value`)
- ✅ **Applica mapping personalizzati** automaticamente
- ✅ Supporta fallback V3 → V4
- ✅ Scrive file `.js` (più flessibile)
- ✅ Supporta configurazione di source files nel config
- ❌ Non ha script `apply-tokens.js` integrato

#### Codice chiave:
```javascript
// Estrae automaticamente dai file sorgente
function extractCssVars(cssContent) {
  const vars = {};
  const regex = /--([\w-]+):\s*([^;]+);/g;
  let match;
  while ((match = regex.exec(cssContent)) !== null) {
    const [, name, value] = match;
    vars[name] = value.trim();
  }
  return vars;
}

// Legge dai file configurati
if (source.type === 'css') {
  tokenData = { ...tokenData, ...extractCssVars(content) };
} else if (source.type === 'scss') {
  tokenData = { ...tokenData, ...await parseScssTokens(content) };
}
```

#### Configurazione esempio:
```json
{
  "tokenMappings": {
    "colors": {
      "source": {
        "v4": [
          { "path": "{v4}/src/styles/globals.css", "type": "css" },
          { "path": "{v4}/src/styles/shadcn.css", "type": "css" }
        ]
      },
      "primary": { "v4Name": "--primary" },
      "secondary": { "v4Name": "--secondary" }
    }
  }
}
```

#### Quando usarlo:
- ✅ **CASO D'USO PRINCIPALE**: Migrare token da progetto esistente
- Hai file CSS/SCSS con variabili da estrarre
- Vuoi automazione massima
- Non vuoi configurare manualmente ogni valore

---

### 3. migration-v3

**Approccio**: Basato su configurazione, migliorato  
**Efficacia**: ⭐⭐⭐ (3/5)

#### Caratteristiche:
- ✅ Crea token da configurazione JSON
- ✅ Supporta tutti i token dimensionali (spacing, padding, margin, borderRadius, borderWidth)
- ✅ **Scrive direttamente nel path v6** (migliore di v0)
- ✅ Supporta `lineHeight` in typography
- ✅ Genera file index.js
- ✅ Supporta dry-run
- ✅ Ha script `apply-tokens.js`
- ❌ **NON legge dai file sorgente** - richiede configurazione manuale

#### Differenze rispetto a v0:
- Scrive in `config.paths.v6` invece che directory corrente
- Supporta lineHeight in typography
- Struttura più pulita

#### Quando usarlo:
- Hai configurazione completa pronta
- Preferisci controllo manuale
- Vuoi scrivere direttamente nel progetto target

---

## 🔍 Analisi Tecnica Dettagliata

### Estrazione Automatica (v1/v2)

**Vantaggi:**
1. **Zero configurazione manuale** dei valori - legge direttamente dai file
2. **Supporto multi-formato**: CSS variables, SCSS variables, JSON
3. **Mapping automatico**: Applica trasformazioni da v3Name/v4Name
4. **Fallback intelligente**: Prova V4, poi V3 se non trova
5. **Flessibilità**: Supporta multiple source files

**Esempio reale:**
```css
/* File sorgente: src/styles/globals.css */
:root {
  --primary: #007bff;
  --secondary: #6c757d;
  --spacing-4: 1rem;
}
```

Il tool v1/v2:
1. Legge il file CSS
2. Estrae `--primary`, `--secondary`, `--spacing-4`
3. Applica mapping da config
4. Genera file token.js

**Risultato**: Token migrati automaticamente senza dover copiare manualmente i valori!

---

### Configurazione Manuale (v0/v3)

**Svantaggi:**
1. **Devi conoscere tutti i valori** prima di configurare
2. **Duplicazione**: I valori sono nel progetto sorgente E nella config
3. **Manutenzione**: Se cambiano i valori nel sorgente, devi aggiornare la config
4. **Error-prone**: Facile dimenticare token o sbagliare valori

**Esempio:**
```json
{
  "colors": {
    "primary": { "v4Name": "#007bff" },  // Devi sapere questo valore!
    "secondary": { "v4Name": "#6c757d" } // E questo!
  }
}
```

---

## 📈 Metriche di Efficacia

| Criterio | v0 | v1/v2 | v3 |
|----------|----|----|----|
| **Estrazione automatica** | ❌ | ✅ | ❌ |
| **Supporto CSS variables** | ❌ | ✅ | ❌ |
| **Supporto SCSS variables** | ❌ | ✅ | ❌ |
| **Configurazione minima** | ❌ | ✅ | ❌ |
| **Token dimensionali completi** | ✅ | ⚠️ | ✅ |
| **Script apply-tokens** | ✅ | ❌ | ✅ |
| **Scrittura in path target** | ❌ | ✅ | ✅ |
| **Dry-run support** | ✅ | ⚠️ | ✅ |
| **Generazione index.js** | ✅ | ✅ | ✅ |

---

## 🎯 Raccomandazione Finale

### Per migrare token da progetto A → B:

**Usa migration-v1/v2** se:
- ✅ Vuoi estrarre automaticamente dai file sorgente
- ✅ Hai file CSS/SCSS con variabili
- ✅ Vuoi minimizzare configurazione manuale
- ✅ Preferisci automazione

**Usa migration-v3** se:
- ✅ Hai già una configurazione completa dei token
- ✅ Vuoi controllo totale sui valori
- ✅ Vuoi applicare token ai file esistenti (apply-tokens.js)
- ✅ Preferisci approccio basato su config

**Evita migration-v0** perché:
- ❌ Scrive nella directory corrente invece che nel target
- ❌ Manca supporto lineHeight
- ❌ Versione meno raffinata di v3

---

## 💡 Esempio Pratico

### Scenario: Migrare token da OpenFav V4 a V6

**Con migration-v1/v2:**
```bash
# 1. Configura solo i path e i mapping
{
  "paths": {
    "v4": "/path/to/v4",
    "v6": "/path/to/v6"
  },
  "tokenMappings": {
    "colors": {
      "source": {
        "v4": [{ "path": "{v4}/src/styles/globals.css", "type": "css" }]
      },
      "primary": { "v4Name": "--primary" }
    }
  }
}

# 2. Esegui - estrae automaticamente!
npm run migrate:design-tokens
```

**Con migration-v3:**
```bash
# 1. Devi prima leggere manualmente i valori dal progetto V4
# 2. Configurare tutti i valori nella config
{
  "tokenMappings": {
    "colors": {
      "primary": { "v4Name": "#007bff" },  // Devi sapere questo!
      "secondary": { "v4Name": "#6c757d" }  // E questo!
    }
  }
}

# 3. Esegui
npm run migrate:design-tokens
```

**Risultato**: v1/v2 fa tutto automaticamente, v3 richiede lavoro manuale.

---

## 🔧 Funzionalità Aggiuntive

### apply-tokens.js (v0/v3)

Questo script è utile per **applicare** i token già generati ai file del progetto:

- Trasforma classi Tailwind: `bg-[#007bff]` → `bg-primary`
- Trasforma stili inline: `color: #007bff` → `color: theme.palette.primary`
- Processa ricorsivamente tutti i file

**Nota**: Questo è complementare alla migrazione, non sostitutivo. v1/v2 migra i token, ma non li applica automaticamente ai file.

---

## ✅ Conclusione

**migration-v1/v2** è la scelta migliore per efficacia nella migrazione dei token perché:
1. Estrae automaticamente dai file sorgente
2. Supporta formati multipli (CSS, SCSS)
3. Richiede configurazione minima
4. Applica mapping automaticamente

**migration-v3** è utile se:
- Hai già configurazione completa
- Vuoi script apply-tokens integrato
- Preferisci controllo manuale

