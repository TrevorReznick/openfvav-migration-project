/**
 * Estrae token dai file CSS (CSS variables, component classes)
 */

import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Estrae CSS variables da un file CSS
 * @param {string} cssPath - Path al file CSS
 * @returns {Object} - Oggetto con le CSS variables estratte
 */
export function extractCssVariables(cssPath) {
  try {
    const content = readFileSync(cssPath, 'utf-8');
    const variables = {};
    
    // Pattern per CSS variables: --variable-name: value;
    const regex = /--([\w-]+):\s*([^;]+);/g;
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      const [, name, value] = match;
      variables[name] = value.trim();
    }
    
    return variables;
  } catch (error) {
    throw new Error(`Error extracting CSS variables from ${cssPath}: ${error.message}`);
  }
}

/**
 * Estrae component classes da un file CSS
 * @param {string} cssPath - Path al file CSS
 * @returns {Array} - Array di oggetti con le component classes
 */
export function extractComponentClasses(cssPath) {
  try {
    const content = readFileSync(cssPath, 'utf-8');
    const componentClasses = [];
    
    // Pattern per component classes in @layer components
    // .class-name { @apply ...; }
    const layerPattern = /@layer\s+components\s*\{([^}]+(?:\{[^}]+\}[^}]*)*)\}/s;
    const layerMatch = content.match(layerPattern);
    
    if (layerMatch) {
      const layerContent = layerMatch[1];
      
      // Estrai ogni classe
      const classPattern = /\.([\w-]+)\s*\{([^}]+)\}/g;
      let match;
      
      while ((match = classPattern.exec(layerContent)) !== null) {
        const className = match[1];
        const classContent = match[2];
        
        // Estrai @apply directives
        const applyMatches = classContent.match(/@apply\s+([^;]+);/g);
        const applyClasses = applyMatches 
          ? applyMatches.map(m => m.replace(/@apply\s+/, '').replace(/;$/, '').trim())
          : [];
        
        // Estrai altre proprietà CSS
        const cssProperties = {};
        const propertyPattern = /([\w-]+):\s*([^;]+);/g;
        let propMatch;
        
        while ((propMatch = propertyPattern.exec(classContent)) !== null) {
          if (propMatch[1] !== 'apply') {
            cssProperties[propMatch[1]] = propMatch[2].trim();
          }
        }
        
        componentClasses.push({
          name: className,
          applyClasses,
          cssProperties,
          fullContent: classContent.trim(),
        });
      }
    }
    
    return componentClasses;
  } catch (error) {
    throw new Error(`Error extracting component classes from ${cssPath}: ${error.message}`);
  }
}

/**
 * Estrae tutti i token da un file CSS
 * @param {string} sourcePath - Path alla directory sorgente
 * @param {string} cssFileName - Nome del file CSS (default: "index.css")
 * @returns {Object} - Oggetto con tutti i token estratti
 */
export function extractTokensFromCss(sourcePath, cssFileName = 'index.css') {
  const cssPath = join(sourcePath, 'src', cssFileName);
  
  try {
    return {
      cssVariables: extractCssVariables(cssPath),
      componentClasses: extractComponentClasses(cssPath),
    };
  } catch (error) {
    // Prova anche in src/styles/
    const altCssPath = join(sourcePath, 'src', 'styles', cssFileName);
    try {
      return {
        cssVariables: extractCssVariables(altCssPath),
        componentClasses: extractComponentClasses(altCssPath),
      };
    } catch (altError) {
      throw new Error(`Could not find ${cssFileName} in ${sourcePath}/src/ or ${sourcePath}/src/styles/`);
    }
  }
}

