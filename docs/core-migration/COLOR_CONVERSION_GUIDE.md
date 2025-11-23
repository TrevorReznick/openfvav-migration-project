# 🎨 Guida Completa: Convertitore di Formati Colore

## 📋 Introduzione

Questa guida documenta il sistema di conversione colori per il progetto OpenFav Migration Tool, che converte tra diversi formati di colore per adattare i temi tra V4 (HEX/RGB) e V6 (HSL).

## 🎯 Obiettivi del Convertitore

- **Da HEX a HSL**: Per adattare colori da V4 a V6
- **Da RGB a HSL**: Per colori con trasparenza
- **Formato Tailwind**: Compatibile con `hsl(var(--color-primary))`
- **Preservazione variante**: Supporta colori con varianti (primary, primary-hover, primary-light)

## 🔧 Formati Supportati

### 1. HEX (V4)
```css
/* Input V4 */
color: #7C3AED;
background: #0F172A;
```

### 2. RGB/RGBA (V4)
```css
/* Input V4 */
color: rgba(124, 58, 237, 0.8);
background: rgba(15, 23, 42, 0.3);
```

### 3. HSL (V6 - Target)
```css
/* Output V6 */
color: hsl(var(--color-primary)); /* 270 81% 60% */
color: hsl(var(--color-primary) / 0.8);
```

## 📊 Mappatura Colori Standard

| V4 (HEX) | V6 (HSL) | Nome Variabile |
|----------|----------|----------------|
| `#7C3AED` | `270 81% 60%` | `--color-primary` |
| `#0F172A` | `222 47% 11%` | `--color-secondary` |
| `#A855F7` | `270 91% 65%` | `--color-accent` |
| `#FFFFFF` | `0 0% 100%` | `--color-white` |
| `#000000` | `0 0% 0%` | `--color-black` |

## 🛠️ Implementazione Base

### Funzione HEX → HSL

```javascript
/**
 * Converte HEX in HSL (formato Tailwind)
 * @param {string} hex - "#7C3AED" o "7C3AED"
 * @returns {string} - "270 81% 60%"
 */
function hexToHsl(hex) {
  // Rimuovi # se presente
  hex = hex.replace('#', '');
  
  // Valida formato
  if (!/^[0-9A-Fa-f]{6}$/.test(hex)) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  
  // Converti in RGB (0-255)
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  // Calcola HSL
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  } else {
    h = s = 0; // Grigio
  }
  
  // Converti in gradi e percentuali
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);
  
  return `${h} ${s}% ${l}%`;
}
```

### Funzione RGBA → HSL

```javascript
/**
 * Converte RGBA in HSL con opacity
 * @param {string} rgbaString - "rgba(30, 41, 59, 0.3)"
 * @returns {string} - "222 47% 11% / 0.3"
 */
function rgbaStringToHsl(rgbaString) {
  const match = rgbaString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!match) throw new Error(`Invalid RGBA: ${rgbaString}`);
  
  const r = parseInt(match[1], 10);
  const g = parseInt(match[2], 10);
  const b = parseInt(match[3], 10);
  const a = match[4] ? parseFloat(match[4]) : 1;
  
  // Converti in HSL usando la funzione rgbaToHsl
  return rgbaToHsl(r, g, b, a);
}
```

## 🎨 Gestione Colori con Varianti

### Struttura per V6
```javascript
const colors = {
  primary: {
    DEFAULT: "270 81% 60%",
    hover: "270 75% 52%",
    light: "270 91% 65%",
    dark: "270 85% 45%"
  },
  secondary: {
    DEFAULT: "222 47% 11%",
    light: "222 39% 20%"
  }
};
```

### CSS Generato
```css
:root {
  --color-primary: 270 81% 60%;
  --color-primary-hover: 270 75% 52%;
  --color-primary-light: 270 91% 65%;
  --color-secondary: 222 47% 11%;
  --color-secondary-light: 222 39% 20%;
}
```

## 🌙 Supporto Dark Mode

### Implementazione CSS
```css
/* Light mode (default) */
:root {
  --color-background: 0 0% 100%;
  --color-foreground: 222 47% 11%;
}

/* Dark mode */
.dark {
  --color-background: 222 47% 11%;
  --color-foreground: 0 0% 100%;
}
```

### Utilizzo in Tailwind
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--color-background))",
        foreground: "hsl(var(--color-foreground))"
      }
    }
  }
};
```

## 🔍 Testing e Validazione

### Test Cases
```javascript
const testCases = [
  { input: "#7C3AED", expected: "270 81% 60%" },
  { input: "#0F172A", expected: "222 47% 11%" },
  { input: "rgba(124, 58, 237, 0.8)", expected: "270 81% 60% / 0.8" },
  { input: "rgb(15, 23, 42)", expected: "222 47% 11%" }
];
```

### Funzione di Conversione Universale
```javascript
/**
 * Converte qualsiasi formato colore in HSL
 */
function convertColorToHsl(colorValue) {
  if (!colorValue || typeof colorValue !== 'string') {
    return colorValue;
  }
  
  const trimmed = colorValue.trim();
  
  // Già HSL
  if (trimmed.startsWith('hsl(') || /^\d+\s+\d+%\s+\d+%/.test(trimmed)) {
    return trimmed;
  }
  
  // HEX
  if (trimmed.startsWith('#') || /^[0-9A-Fa-f]{6}$/.test(trimmed)) {
    return hexToHsl(trimmed);
  }
  
  // RGB/RGBA
  if (trimmed.startsWith('rgba') || trimmed.startsWith('rgb')) {
    return rgbaStringToHsl(trimmed);
  }
  
  return trimmed; // Non riconosciuto, restituisci originale
}
```

## 📋 Best Practices

### 1. Validazione Input
```javascript
function validateColorInput(color) {
  const hexRegex = /^#?([0-9A-Fa-f]{6})$/;
  const rgbRegex = /rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+\s*)?\)/;
  const hslRegex = /hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(?:\/\s*[\d.]+%?\s*)?\)/;
  
  return hexRegex.test(color) || rgbRegex.test(color) || hslRegex.test(color);
}
```

### 2. Gestione Errori
```javascript
function safeConvertColor(color, fallback = '0 0% 0%') {
  try {
    return convertColorToHsl(color);
  } catch (error) {
    console.warn(`Color conversion failed for ${color}:`, error.message);
    return fallback;
  }
}
```

## 🚀 Integrazione con Migration Tool

### Esempio di Utilizzo
```javascript
// In migrate-tokens.js
import { convertColorToHsl } from '../utils/color-converter.js';

function convertThemeColors(colorTokens) {
  const converted = {};
  
  for (const [name, value] of Object.entries(colorTokens)) {
    if (typeof value === 'object') {
      // Colori con varianti
      converted[name] = {};
      for (const [variant, color] of Object.entries(value)) {
        converted[name][variant] = convertColorToHsl(color);
      }
    } else {
      // Colore singolo
      converted[name] = convertColorToHsl(value);
    }
  }
  
  return converted;
}
```

## 📚 Risorse Utili

- [MDN - Color Picker Tool](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Colors/Color_picker_tool)
- [Tailwind CSS - Custom Colors](https://tailwindcss.com/docs/customizing-colors)
- [HSL Color Picker](https://hslpicker.com/)
- [Color Hex to HSL Converter](https://www.hexcolortool.com/)

---

**Nota**: Questo convertitore è progettato specificamente per le esigenze di OpenFav V6 e mantiene compatibilità con il sistema di design tokens esistente.