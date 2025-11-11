# 🗺️ Mappatura Dettagliata Stili: Astroflux-V4 → Openfav-Dev

## 📋 Obiettivo

Documentare la mappatura dettagliata di tutti gli stili da astroflux-v4 a openfav-dev, con esempi concreti di conversione.

---

## 🎨 Mappatura Colori

### Colori Principali

#### Primary Color

**Astroflux-V4:**
```typescript
// tailwind.config.ts
primary: {
  DEFAULT: "#7C3AED",    // Hex
  hover: "#6D28D9",
  light: "#A855F7",
}

// index.css
--primary-color: #7C3AED;
--primary-hover: #6D28D9;
```

**Conversione Hex → HSL:**
- `#7C3AED` → `270 81% 60%` (HSL)
- `#6D28D9` → `270 75% 52%` (HSL)
- `#A855F7` → `270 91% 65%` (HSL)

**Openfav-Dev (target):**
```typescript
// src/lib/tokens.ts
colors: {
  primary: 'primary',  // Aggiungere varianti
}

// src/styles/globals.css
:root {
  --color-primary: 270 81% 60%;
  --color-primary-hover: 270 75% 52%;
  --color-primary-light: 270 91% 65%;
  
  /* Theme variables */
  --primary: 270 81% 60%;
  --primary-foreground: 0 0% 98%;
}

// tailwind.config.ts
primary: {
  DEFAULT: "hsl(var(--primary))",
  foreground: "hsl(var(--primary-foreground))",
  hover: "hsl(var(--color-primary-hover))",
  light: "hsl(var(--color-primary-light))",
}
```

#### Secondary Color

**Astroflux-V4:**
```typescript
secondary: {
  DEFAULT: "#0F172A",    // Hex
  light: "#1E293B",
}

// index.css
--secondary-color: #1E293B;
```

**Conversione:**
- `#0F172A` → `222 47% 11%` (HSL)
- `#1E293B` → `222 39% 20%` (HSL)

**Openfav-Dev (target):**
```css
:root {
  --color-secondary: 222 47% 11%;
  --color-secondary-light: 222 39% 20%;
  --secondary: 222 47% 11%;
  --secondary-foreground: 0 0% 98%;
}
```

#### Accent Color

**Astroflux-V4:**
```typescript
accent: {
  DEFAULT: "#A855F7",
  light: "#C084FC",
}
```

**Conversione:**
- `#A855F7` → `270 91% 65%` (HSL)
- `#C084FC` → `270 95% 75%` (HSL)

**Openfav-Dev (target):**
```css
:root {
  --color-accent: 270 91% 65%;
  --color-accent-light: 270 95% 75%;
  --accent: 270 91% 65%;
  --accent-foreground: 0 0% 98%;
}
```

#### Page Colors

**Astroflux-V4:**
```typescript
page: {
  background: "#0F172A",
  text: "#FFFFFF",
}
```

**Conversione:**
- `#0F172A` → `222 47% 11%` (HSL)
- `#FFFFFF` → `0 0% 100%` (HSL)

**Openfav-Dev (target):**
```css
:root {
  --background: 222 47% 11%;
  --foreground: 0 0% 100%;
}
```

#### Card Colors (RGBA)

**Astroflux-V4:**
```typescript
card: {
  background: "rgba(30, 41, 59, 0.3)",
  border: "rgba(255, 255, 255, 0.1)",
}
```

**Conversione RGBA → HSL:**
- `rgba(30, 41, 59, 0.3)` → `222 33% 17%` con opacity `0.3`
- `rgba(255, 255, 255, 0.1)` → `0 0% 100%` con opacity `0.1`

**Openfav-Dev (target):**
```css
:root {
  --card: 222 33% 17% / 0.3;  /* HSL con opacity */
  --card-foreground: 0 0% 100%;
  --card-border: 0 0% 100% / 0.1;
}
```

**Nota:** Tailwind CSS v3+ supporta opacity in HSL: `hsl(222 33% 17% / 0.3)`

#### Button Colors

**Astroflux-V4:**
```typescript
button: {
  primary: "#7C3AED",
  primaryHover: "#6D28D9",
  secondary: "#1E293B",
  secondaryHover: "rgba(255, 255, 255, 0.1)",
}
```

**Openfav-Dev (target):**
```css
:root {
  --button-primary: 270 81% 60%;
  --button-primary-hover: 270 75% 52%;
  --button-secondary: 222 39% 20%;
  --button-secondary-hover: 0 0% 100% / 0.1;
}
```

---

## 📏 Mappatura Spacing

### Astroflux-V4

**Non definito esplicitamente** - usa spacing default Tailwind

### Openfav-Dev

**Già presente:**
```typescript
// src/lib/tokens.ts
spacing: {
  '0': '0',
  '1': '0.25rem',
  '2': '0.5rem',
  '3': '0.75rem',
  '4': '1rem',
  '5': '1.25rem',
  '6': '1.5rem',
  '8': '2rem',
  // ...
}
```

**Azione:** ✅ Nessuna migrazione necessaria (usa standard Tailwind)

---

## 🔤 Mappatura Typography

### Font Family

**Astroflux-V4:**
```css
/* index.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

body {
  font-['Inter']
}
```

**Openfav-Dev:**
```css
/* globals.css */
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;
--font-mono: 'Roboto Mono', monospace;
```

**Azione:** ✅ Già compatibile (Inter è già presente)

### Font Sizes

**Astroflux-V4:**
- Usa classi Tailwind standard: `text-base`, `text-lg`, `text-xl`, etc.

**Openfav-Dev:**
```css
--font-size-sm: 0.875rem;
--font-size-base: 1rem;
--font-size-lg: 1.125rem;
```

**Azione:** ✅ Nessuna migrazione necessaria (usa standard Tailwind)

---

## 🎭 Mappatura Component Classes

### `.glass-card`

**Astroflux-V4:**
```css
.glass-card {
  @apply bg-secondary-light/30 backdrop-blur-lg border border-white/10 rounded-xl;
  background-color: var(--card-bg);
  border-color: var(--card-border);
  backdrop-filter: blur(16px);
}
```

**Openfav-Dev - Opzione A (Utility Classes):**
```tsx
// Component usage
<div className="bg-card/30 backdrop-blur-lg border border-card-border rounded-xl">
  {/* content */}
</div>
```

**Openfav-Dev - Opzione B (Component Class):**
```css
/* globals.css */
@layer components {
  .glass-card {
    @apply bg-card/30 backdrop-blur-lg border border-card-border rounded-xl;
    backdrop-filter: blur(16px);
  }
}
```

**Raccomandazione:** Opzione A (utility classes) per coerenza con openfav-dev

### `.btn-primary`

**Astroflux-V4:**
```css
.btn-primary {
  @apply px-6 py-3 bg-primary text-white rounded-lg font-medium 
         transition-all duration-300 hover:bg-primary-hover hover:scale-105 
         focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-secondary;
  background-color: var(--primary-color);
}
```

**Openfav-Dev - Opzione A (Utility Classes):**
```tsx
<button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium 
                   transition-all duration-300 hover:bg-primary-hover hover:scale-105 
                   focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
  Button
</button>
```

**Openfav-Dev - Opzione B (Component Class):**
```css
@layer components {
  .btn-primary {
    @apply px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium 
           transition-all duration-300 hover:bg-primary-hover hover:scale-105 
           focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2;
  }
}
```

**Raccomandazione:** Opzione A (utility classes) o usare componente Button esistente

### `.btn-secondary`

**Astroflux-V4:**
```css
.btn-secondary {
  @apply px-6 py-3 bg-secondary-light text-white rounded-lg font-medium 
         transition-all duration-300 hover:bg-white/10 
         focus:outline-none focus:ring-2 focus:ring-white/20;
  background-color: var(--secondary-color);
}
```

**Openfav-Dev:**
```tsx
<button className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium 
                   transition-all duration-300 hover:bg-secondary/80 
                   focus:outline-none focus:ring-2 focus:ring-secondary/20">
  Button
</button>
```

### `.feature-card`

**Astroflux-V4:**
```css
.feature-card {
  @apply glass-card p-6 transition-all duration-300 hover:scale-105 hover:bg-secondary-light/40;
}
```

**Openfav-Dev:**
```tsx
<div className="bg-card/30 backdrop-blur-lg border border-card-border rounded-xl p-6 
                transition-all duration-300 hover:scale-105 hover:bg-card/40">
  {/* content */}
</div>
```

---

## 🎬 Mappatura Keyframes e Animazioni

### Keyframes Astroflux-V4

```typescript
keyframes: {
  "fade-in": {
    "0%": { opacity: "0", transform: "translateY(10px)" },
    "100%": { opacity: "1", transform: "translateY(0)" },
  },
  "fade-in-slow": {
    "0%": { opacity: "0" },
    "100%": { opacity: "1" },
  },
  float: {
    "0%, 100%": { transform: "translateY(0)" },
    "50%": { transform: "translateY(-10px)" },
  },
}
```

### Aggiunta a Openfav-Dev

```typescript
// tailwind.config.ts
extend: {
  keyframes: {
    // ... existing
    "fade-in": {
      "0%": { opacity: "0", transform: "translateY(10px)" },
      "100%": { opacity: "1", transform: "translateY(0)" },
    },
    "fade-in-slow": {
      "0%": { opacity: "0" },
      "100%": { opacity: "1" },
    },
    float: {
      "0%, 100%": { transform: "translateY(0)" },
      "50%": { transform: "translateY(-10px)" },
    },
  },
  animation: {
    // ... existing
    "fade-in": "fade-in 0.6s ease-out",
    "fade-in-slow": "fade-in-slow 0.8s ease-out",
    float: "float 6s ease-in-out infinite",
  },
}
```

**Azione:** ✅ Aggiungere direttamente (nessun conflitto)

---

## 🔄 Esempio Completo di Conversione

### Componente Astroflux-V4

```tsx
// Astroflux-V4
<div className="glass-card p-6">
  <h3 className="text-lg font-semibold mb-2 text-white">Title</h3>
  <p className="text-white/70">Description</p>
  <button className="btn-primary">Click me</button>
</div>
```

### Componente Openfav-Dev (dopo migrazione)

```tsx
// Openfav-Dev
<div className="bg-card/30 backdrop-blur-lg border border-card-border rounded-xl p-6">
  <h3 className="text-lg font-semibold mb-2 text-foreground">Title</h3>
  <p className="text-foreground/70">Description</p>
  <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium 
                     transition-all duration-300 hover:bg-primary-hover hover:scale-105">
    Click me
  </button>
</div>
```

### Mappatura Classi

| Astroflux-V4 | Openfav-Dev | Note |
|--------------|-------------|------|
| `glass-card` | `bg-card/30 backdrop-blur-lg border border-card-border rounded-xl` | Component class → utilities |
| `text-white` | `text-foreground` | Usa design token |
| `text-white/70` | `text-foreground/70` | Usa design token con opacity |
| `btn-primary` | `px-6 py-3 bg-primary text-primary-foreground ...` | Component class → utilities |

---

## 📝 Checklist Migrazione

### Fase 1: Estrazione
- [ ] Estrarre colori da `tailwind.config.ts`
- [ ] Estrarre CSS variables da `index.css`
- [ ] Estrarre component classes da `index.css`
- [ ] Estrarre keyframes da `tailwind.config.ts`

### Fase 2: Conversione
- [ ] Convertire hex → HSL (tutti i colori)
- [ ] Convertire RGBA → HSL (card colors)
- [ ] Validare valori HSL

### Fase 3: Generazione Design Tokens
- [ ] Aggiornare `src/lib/tokens.ts` con nuovi colori
- [ ] Aggiornare `src/styles/globals.css` con CSS variables
- [ ] Aggiornare `tailwind.config.ts` con nuovi colori

### Fase 4: Migrazione Component Classes
- [ ] Convertire `.glass-card` → utility classes
- [ ] Convertire `.btn-primary` → utility classes
- [ ] Convertire `.btn-secondary` → utility classes
- [ ] Convertire `.feature-card` → utility classes

### Fase 5: Keyframes
- [ ] Aggiungere keyframes a `tailwind.config.ts`
- [ ] Aggiungere animazioni a `tailwind.config.ts`

### Fase 6: Testing
- [ ] Verificare conversione colori
- [ ] Verificare riproduzione stile visivamente
- [ ] Testare componenti migrati
- [ ] Validare dark mode

---

## 🛠️ Tool di Conversione Necessari

### 1. Hex → HSL Converter

```javascript
function hexToHsl(hex) {
  // Rimuovi #
  hex = hex.replace('#', '');
  
  // Converti in RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  // Converti in HSL
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  
  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  
  // Formato per Tailwind: "H S% L%"
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
```

### 2. RGBA → HSL Converter

```javascript
function rgbaToHsl(r, g, b, a) {
  // Converti RGB in HSL
  const hsl = rgbToHsl(r, g, b);
  
  // Formato per Tailwind con opacity: "H S% L% / opacity"
  return `${hsl} / ${a}`;
}
```

### 3. CSS Variable Extractor

```javascript
function extractCssVariables(cssContent) {
  const regex = /--([\w-]+):\s*([^;]+);/g;
  const variables = {};
  let match;
  
  while ((match = regex.exec(cssContent)) !== null) {
    variables[match[1]] = match[2].trim();
  }
  
  return variables;
}
```

---

## 📊 Tabella Riepilogativa Conversioni

| Tipo | Astroflux-V4 | Openfav-Dev | Tool Necessario |
|------|--------------|-------------|-----------------|
| Primary | `#7C3AED` | `270 81% 60%` | Hex → HSL |
| Secondary | `#0F172A` | `222 47% 11%` | Hex → HSL |
| Accent | `#A855F7` | `270 91% 65%` | Hex → HSL |
| Card BG | `rgba(30, 41, 59, 0.3)` | `222 33% 17% / 0.3` | RGBA → HSL |
| Card Border | `rgba(255, 255, 255, 0.1)` | `0 0% 100% / 0.1` | RGBA → HSL |
| Component Class | `.glass-card` | Utility classes | Parser CSS |
| Keyframes | `fade-in` | `fade-in` | Copia diretta |

---

## ✅ Conclusione

La mappatura è **dettagliata e fattibile**. Tutti i valori possono essere convertiti e mappati correttamente. Il sistema di design tokens di openfav-dev è **adeguato** per supportare tutti gli stili di astroflux-v4.

**Prossimi passi:**
1. Implementare tool di conversione
2. Eseguire estrazione e conversione
3. Generare design tokens
4. Migrare component classes
5. Testare e validare


