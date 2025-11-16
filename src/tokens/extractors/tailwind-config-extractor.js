/**
 * Estrae token dal file tailwind.config.ts
 */

import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Estrae i colori dal tailwind.config.ts
 * @param {string} configPath - Path al file tailwind.config.ts
 * @returns {Object} - Oggetto con i colori estratti
 */
export function extractColorsFromTailwindConfig(configPath) {
  try {
    const content = readFileSync(configPath, 'utf-8');
    const colors = {};
    
    // Cerca la sezione extend.colors
    // Pattern più robusto che gestisce nested objects
    const extendMatch = content.match(/extend:\s*\{([\s\S]*?)\n\s*\},?\s*\n\s*\},?\s*\n\s*plugins/s);
    
    if (!extendMatch) {
      // Prova pattern alternativo
      const altMatch = content.match(/extend:\s*\{([\s\S]+?)\n\s*\},?\s*\n\s*\}/);
      if (!altMatch) {
        return colors;
      }
    }
    
    // Estrai la sezione colors: { ... }
    const colorsMatch = content.match(/colors:\s*\{([\s\S]*?)\n\s*\},/);
    
    if (!colorsMatch) {
      return colors;
    }
    
    const colorsContent = colorsMatch[1];
    
    // Estrai colori nested (con varianti)
    // Pattern: primary: { DEFAULT: "#7C3AED", hover: "#6D28D9" }
    const nestedColorPattern = /(\w+):\s*\{([\s\S]*?)\n\s*\},?/g;
    let match;
    
    while ((match = nestedColorPattern.exec(colorsContent)) !== null) {
      const colorName = match[1];
      const colorBody = match[2];
      
      // Estrai varianti
      const variants = {};
      const variantPattern = /(\w+):\s*["']([^"']+)["']/g;
      let variantMatch;
      
      while ((variantMatch = variantPattern.exec(colorBody)) !== null) {
        const variantName = variantMatch[1];
        const variantValue = variantMatch[2];
        variants[variantName] = variantValue;
      }
      
      if (Object.keys(variants).length > 0) {
        colors[colorName] = variants;
      }
    }
    
    // Estrai colori semplici (non nested) che non sono già stati estratti
    // Cerca pattern come: border: "hsl(var(--border))",
    const simpleColorPattern = /(\w+):\s*["']([^"']+)["'],?\s*\n/g;
    while ((match = simpleColorPattern.exec(colorsContent)) !== null) {
      const colorName = match[1];
      const colorValue = match[2];
      
      // Salta se è già stato estratto come nested
      if (!colors[colorName]) {
        // Accetta qualsiasi valore (hex, rgba, hsl, var, etc.)
        colors[colorName] = colorValue;
      }
    }
    
    return colors;
  } catch (error) {
    throw new Error(`Error extracting colors from tailwind.config.ts: ${error.message}`);
  }
}

/**
 * Estrae keyframes dal tailwind.config.ts
 * @param {string} configPath - Path al file tailwind.config.ts
 * @returns {Object} - Oggetto con i keyframes estratti
 */
export function extractKeyframesFromTailwindConfig(configPath) {
  try {
    const content = readFileSync(configPath, 'utf-8');
    const keyframes = {};
    
    // Estrai la sezione keyframes: { ... }
    // Pattern più robusto che gestisce nested objects
    const keyframesMatch = content.match(/keyframes:\s*\{([\s\S]*?)\n\s*\},?\s*\n\s*animation:/);
    
    if (!keyframesMatch) {
      // Prova pattern alternativo senza animation dopo
      const altMatch = content.match(/keyframes:\s*\{([\s\S]*?)\n\s*\},/);
      if (!altMatch) {
        return keyframes;
      }
      var keyframesContent = altMatch[1];
    } else {
      var keyframesContent = keyframesMatch[1];
    }
    
    // Estrai ogni keyframe
    // Pattern: "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } }
    // o: float: { "0%, 100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } }
    const keyframePattern = /"([^"]+)":\s*\{([\s\S]*?)\n\s*\},?/g;
    let match;
    
    while ((match = keyframePattern.exec(keyframesContent)) !== null) {
      const keyframeName = match[1];
      const keyframeBody = match[2];
      
      // Estrai i frame (0%, 100%, "0%, 100%", etc.)
      const frames = {};
      // Pattern che gestisce anche "0%, 100%" come chiave
      const framePattern = /"([^"]+)":\s*\{([^}]+)\}/g;
      let frameMatch;
      
      while ((frameMatch = framePattern.exec(keyframeBody)) !== null) {
        frames[frameMatch[1]] = frameMatch[2].trim();
      }
      
      if (Object.keys(frames).length > 0) {
        keyframes[keyframeName] = frames;
      }
    }
    
    return keyframes;
  } catch (error) {
    throw new Error(`Error extracting keyframes from tailwind.config.ts: ${error.message}`);
  }
}

/**
 * Estrae animazioni dal tailwind.config.ts
 * @param {string} configPath - Path al file tailwind.config.ts
 * @returns {Object} - Oggetto con le animazioni estratte
 */
export function extractAnimationsFromTailwindConfig(configPath) {
  try {
    const content = readFileSync(configPath, 'utf-8');
    const animations = {};
    
    // Pattern per animations: "fade-in": "fade-in 0.6s ease-out"
    const animationsPattern = /animation:\s*\{([^}]+)\}/s;
    const animationsMatch = content.match(animationsPattern);
    
    if (animationsMatch) {
      const animationsContent = animationsMatch[1];
      
      // Estrai ogni animazione
      const animationPattern = /"([^"]+)":\s*["']([^"']+)["']/g;
      let match;
      
      while ((match = animationPattern.exec(animationsContent)) !== null) {
        animations[match[1]] = match[2];
      }
    }
    
    return animations;
  } catch (error) {
    throw new Error(`Error extracting animations from tailwind.config.ts: ${error.message}`);
  }
}

/**
 * Estrae tutti i token dal tailwind.config.ts
 * @param {string} sourcePath - Path alla directory sorgente
 * @returns {Object} - Oggetto con tutti i token estratti
 */
export function extractTokensFromTailwindConfig(sourcePath) {
  const configPath = join(sourcePath, 'tailwind.config.ts');
  
  try {
    return {
      colors: extractColorsFromTailwindConfig(configPath),
      keyframes: extractKeyframesFromTailwindConfig(configPath),
      animations: extractAnimationsFromTailwindConfig(configPath),
    };
  } catch (error) {
    // Se non trova tailwind.config.ts, prova tailwind.config.js
    const jsConfigPath = join(sourcePath, 'tailwind.config.js');
    try {
      return {
        colors: extractColorsFromTailwindConfig(jsConfigPath),
        keyframes: extractKeyframesFromTailwindConfig(jsConfigPath),
        animations: extractAnimationsFromTailwindConfig(jsConfigPath),
      };
    } catch (jsError) {
      throw new Error(`Could not find tailwind.config.ts or tailwind.config.js in ${sourcePath}`);
    }
  }
}

