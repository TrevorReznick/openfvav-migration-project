/**
 * Convertitore colori: Hex → HSL, RGBA → HSL
 */

/**
 * Sanitizza la sintassi HSL per CSS quando usa var()
 * Converte virgole in slash quando necessario per compatibilità PostCSS
 * @param {string} hslString - Stringa HSL da sanificare
 * @returns {string} - Stringa HSL sanificata
 */
export function sanitizeForCss(hslString) {
  // se contiene già " / " lascia così
  if (hslString.includes('/')) return hslString;
  
  // se contiene opacità separata da virgola → sposta su " / "
  const m = hslString.match(/^(.+?),\s*([\d.]+)$/);
  return m ? `${m[1]} / ${m[2]}` : hslString;
}

/**
 * Converte un colore hex in HSL (formato Tailwind: "H S% L%")
 * @param {string} hex - Colore hex (es. "#7C3AED" o "7C3AED")
 * @returns {string} - Colore HSL (es. "270 81% 60%")
 */
export function hexToHsl(hex) {
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
  
  // Trova min e max
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  
  // Se max === min, è un grigio (achromatic)
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    // Calcola hue
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
      default:
        h = 0;
    }
  }
  
  // Converti in gradi e percentuali
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);
  
  // Formato Tailwind: "H S% L%"
  return `${h} ${s}% ${l}%`;
}

/**
 * Converte un colore RGBA in HSL con opacity (formato Tailwind: "H S% L% / opacity")
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @param {number} a - Alpha (0-1)
 * @returns {string} - Colore HSL con opacity (es. "222 33% 17% / 0.3")
 */
export function rgbaToHsl(r, g, b, a) {
  // Normalizza RGB (0-1)
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  
  // Converti RGB in HSL
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h, s, l = (max + min) / 2;
  
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case rNorm:
        h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6;
        break;
      case gNorm:
        h = ((bNorm - rNorm) / d + 2) / 6;
        break;
      case bNorm:
        h = ((rNorm - gNorm) / d + 4) / 6;
        break;
      default:
        h = 0;
    }
  }
  
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);
  
  // Formato Tailwind con opacity: "H S% L% / opacity"
  return `${h} ${s}% ${l}% / ${a}`;
}

/**
 * Converte una stringa RGBA in HSL
 * @param {string} rgbaString - Stringa RGBA (es. "rgba(30, 41, 59, 0.3)")
 * @returns {string} - Colore HSL con opacity
 */
export function rgbaStringToHsl(rgbaString) {
  const match = rgbaString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!match) {
    throw new Error(`Invalid RGBA string: ${rgbaString}`);
  }
  
  const r = parseInt(match[1], 10);
  const g = parseInt(match[2], 10);
  const b = parseInt(match[3], 10);
  const a = match[4] ? parseFloat(match[4]) : 1;
  
  return rgbaToHsl(r, g, b, a);
}

/**
 * Converte un valore colore (hex, rgba, hsl) in HSL formato Tailwind
 * @param {string} colorValue - Valore colore (hex, rgba, o già hsl)
 * @returns {string} - Colore HSL formato Tailwind
 */
export function convertColorToHsl(colorValue) {
  if (!colorValue || typeof colorValue !== 'string') {
    return colorValue;
  }
  
  const trimmed = colorValue.trim();
  
  // Se è già HSL, restituisci così com'è
  if (trimmed.startsWith('hsl(') || /^\d+\s+\d+%\s+\d+%/.test(trimmed)) {
    return trimmed;
  }
  
  // Se è hex
  if (trimmed.startsWith('#') || /^[0-9A-Fa-f]{6}$/.test(trimmed)) {
    return hexToHsl(trimmed);
  }
  
  // Se è rgba
  if (trimmed.startsWith('rgba') || trimmed.startsWith('rgb')) {
    return rgbaStringToHsl(trimmed);
  }
  
  // Se non riconosciuto, restituisci originale
  return trimmed;
}

